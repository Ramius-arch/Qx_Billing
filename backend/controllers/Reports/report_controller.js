const { ErrorResponse } = require('../../middleware/errorHandler');
const db = require('../../models');
const { Op } = require('sequelize');
const Customer = db.Customer;
const UsageLog = db.UsageLog;
const Invoice = db.Invoice;
const Payment = db.Payment;
const Bill = db.Bill;
const Report = db.Report;
const asyncHandler = require('../../middleware/asyncHandler');

async function getUsageTrendData(customerId = null) {
  const whereClause = customerId ? { customerId: customerId } : {};
  const dialect = db.sequelize.getDialect();
  let dateGroup;
  if (dialect === 'postgres') {
    dateGroup = [db.sequelize.fn('to_char', db.sequelize.col('timestamp'), 'YYYY-MM-DD'), 'date'];
  } else {
    dateGroup = [db.sequelize.fn('strftime', '%Y-%m-%d', db.sequelize.col('timestamp')), 'date'];
  }
  const usageLogs = await UsageLog.findAll({
    where: whereClause,
    attributes: [
      dateGroup,
      [db.sequelize.fn('SUM', db.sequelize.col('duration')), 'value']
    ],
    group: ['date'],
    order: [[db.sequelize.literal('date'), 'ASC']],
    raw: true
  });
  return usageLogs.map(log => ({
    date: log.date,
    value: parseFloat(log.value)
  }));
}

exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'All customers report (Minimal)', data: [] });
});

exports.getBillingTrends = asyncHandler(async (req, res, next) => {
  const { period = '30d' } = req.query;
  const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } }) || 0;
  const now = new Date();
  let startDate = new Date();
  let groupFormat;
  let labelKey;
  const dialect = db.sequelize.getDialect();
  if (period === '7d') {
    startDate.setDate(now.getDate() - 7);
    groupFormat = dialect === 'postgres' ? 'YYYY-MM-DD' : '%Y-%m-%d';
    labelKey = 'date';
  } else if (period === '12m') {
    startDate.setFullYear(now.getFullYear() - 1);
    groupFormat = dialect === 'postgres' ? 'YYYY-MM' : '%Y-%m';
    labelKey = 'month';
  } else {
    startDate.setDate(now.getDate() - 30);
    groupFormat = dialect === 'postgres' ? 'YYYY-MM-DD' : '%Y-%m-%d';
    labelKey = 'date';
  }
  const recentRevenue = await Payment.sum('amount', {
    where: {
      status: 'completed',
      payment_date: { [Op.gte]: startDate }
    }
  }) || 0;
  let dateGroup;
  if (dialect === 'postgres') {
    dateGroup = [db.sequelize.fn('to_char', db.sequelize.col('payment_date'), groupFormat), 'label'];
  } else {
    dateGroup = [db.sequelize.fn('strftime', groupFormat, db.sequelize.col('payment_date')), 'label'];
  }
  const trendDataRaw = await Payment.findAll({
    where: { 
      status: 'completed',
      payment_date: { [Op.gte]: startDate }
    },
    attributes: [
      dateGroup,
      [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'revenue']
    ],
    group: ['label'],
    order: [[db.sequelize.literal('label'), 'ASC']],
    raw: true
  });
  const trendData = trendDataRaw.map(data => ({
    [labelKey]: data.label,
    revenue: parseFloat(data.revenue)
  }));
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  const avgMonthlyRevenue = (await Payment.sum('amount', {
    where: { status: 'completed', payment_date: { [Op.gte]: threeMonthsAgo } }
  }) || 0) / 3;
  res.status(200).json({
    success: true,
    message: `Billing trends report (${period})`,
    data: {
      totalRevenue,
      recentRevenue,
      trendData,
      forecast: {
        nextMonthProjected: avgMonthlyRevenue * 1.05,
        confidence: 'medium'
      }
    }
  });
});

exports.getOutstandingDues = asyncHandler(async (req, res, next) => {
  const outstanding = await Invoice.findAll({
    where: { status: { [Op.in]: ['pending', 'overdue'] } },
    include: [{ model: Bill, include: [{ model: Customer, attributes: ['name'] }] }]
  });
  const outstandingFormatted = outstanding.map(invoice => ({
    ...invoice.toJSON(),
    customerName: invoice.Bill?.Customer?.name
  }));
  res.status(200).json({ success: true, message: 'Outstanding dues report', data: outstandingFormatted });
});

exports.generateFinancialSummary = asyncHandler(async (req, res, next) => {
  const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } }) || 0;
  const totalOutstanding = await Invoice.sum('amountDue', { where: { status: { [Op.in]: ['pending', 'overdue'] } } }) || 0;
  res.status(200).json({
    success: true,
    message: 'Financial summary report',
    data: { totalRevenue, totalOutstanding, reportGenerated: new Date() }
  });
});

exports.getUsageReports = asyncHandler(async (req, res, next) => {
  const totalUsageDuration = await UsageLog.sum('duration') || 0;
  const totalCallDuration = await UsageLog.sum('duration', { where: { usageType: 'call' } }) || 0;
  const usageBreakdown = await UsageLog.findAll({
    attributes: ['usageType', [db.sequelize.fn('SUM', db.sequelize.col('duration')), 'totalDuration']],
    group: ['usageType'],
    raw: true
  });
  const activeCustomers = await Customer.count({ where: { status: 'active' } });
  const usageTrends = await getUsageTrendData();
  res.status(200).json({
    success: true,
    message: 'Usage reports',
    data: { totalUsageDuration, totalCallDuration, usageBreakdown, activeCustomers, usageTrends }
  });
});

exports.generateDetailedFinancialReport = asyncHandler(async (req, res, next) => {
  const transactions = await Payment.findAll({
    include: [
      { model: Customer, attributes: ['name'] },
      { model: Bill, include: [{ model: Invoice, attributes: ['invoiceNumber'] }] }
    ],
    order: [['payment_date', 'DESC']]
  });
  const invoices = await Invoice.findAll({
    include: [{ model: Bill, include: [{ model: Customer, attributes: ['name'] }] }],
    order: [['issueDate', 'DESC']]
  });
  const detailedReport = {
    transactions: transactions.map(p => ({
      ...p.toJSON(),
      customerName: p.Customer?.name,
      invoiceNumber: p.Bill?.Invoice?.invoiceNumber
    })),
    invoices: invoices.map(i => ({
      ...i.toJSON(),
      customerName: i.Bill?.Customer?.name
    }))
  };
  res.status(200).json({ success: true, message: 'Detailed financial report', data: detailedReport });
});

exports.getCustomerUsageTrend = asyncHandler(async (req, res, next) => {
  const customers = await Customer.findAll({ attributes: ['id', 'name'] });
  const trends = await Promise.all(customers.map(async customer => {
    const usageTrend = await getUsageTrendData(customer.id);
    return { customerId: customer.id, customerName: customer.name, usageTrend: usageTrend };
  }));
  res.status(200).json({ success: true, message: 'Customer usage trend report', data: trends });
});

exports.getTopCustomers = asyncHandler(async (req, res, next) => {
  const customerSpending = await Payment.findAll({
    attributes: [
      'customerId',
      [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'totalSpent']
    ],
    where: { status: 'completed' },
    group: ['customerId'],
    order: [[db.sequelize.literal('totalSpent'), 'DESC']],
    limit: 5,
    include: [{ model: Customer, attributes: ['name'] }],
    raw: true,
    nest: true
  });
  const topCustomersFormatted = customerSpending.map(cs => ({
    customerId: cs.customerId,
    customerName: cs.Customer?.name,
    totalSpent: parseFloat(cs.totalSpent)
  }));
  res.status(200).json({ success: true, message: 'Top customers report', data: topCustomersFormatted });
});

exports.importMetrics = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, message: 'Metrics imported successfully (placeholder).' });
});
