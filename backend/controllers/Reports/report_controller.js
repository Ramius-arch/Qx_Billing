const { ErrorResponse } = require('../../middleware/errorHandler');
const db = require('../../models'); // Import models from the centralized index.js
const { Op } = require('sequelize'); // Import Op for operators
const Customer = db.Customer;
const UsageLog = db.UsageLog;
const Invoice = db.Invoice;
const Payment = db.Payment;
const Bill = db.Bill;
const Report = db.Report; // Although reports themselves can be generated and stored if needed

const asyncHandler = require('../../middleware/asyncHandler');

// Helper functions (now querying DB)
async function calculateMonthlyUsage(customerId) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usageLogs = await UsageLog.findAll({
    where: {
      customerId: customerId,
      timestamp: {
        [Op.gte]: thirtyDaysAgo
      }
    },
    attributes: ['duration']
  });
  return usageLogs.reduce((acc, log) => acc + log.duration, 0);
}

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

// @desc    Get all customers report
// @route   GET /api/reports/customers
// @access  Private
exports.getAllCustomers = asyncHandler(async (req, res, next) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Optimization: Use subqueries or separate optimized aggregations to avoid N+1 problem
  const customers = await Customer.findAll({
    attributes: ['id', 'name', 'email'],
    include: [
      {
        model: UsageLog,
        attributes: [],
        where: {
          timestamp: { [Op.gte]: thirtyDaysAgo }
        },
        required: false
      }
    ],
    attributes: {
      include: [
        [
          db.sequelize.fn('SUM', db.sequelize.col('UsageLogs.duration')),
          'totalUsage'
        ]
      ]
    },
    group: ['Customer.id'],
    raw: true
  });

  // Fetch outstanding invoices in a single query map for performance
  const outstandingMap = await Invoice.findAll({
    attributes: [
      'customerId',
      [db.sequelize.fn('SUM', db.sequelize.col('amountDue')), 'totalOutstanding']
    ],
    where: {
      status: { [Op.in]: ['pending', 'overdue'] }
    },
    group: ['customerId'],
    raw: true
  });

  const outstandingLookup = outstandingMap.reduce((acc, curr) => {
    acc[curr.customerId] = parseFloat(curr.totalOutstanding);
    return acc;
  }, {});

  const data = customers.map(c => ({
    ...c,
    totalUsage: parseFloat(c.totalUsage) || 0,
    outstandingInvoices: outstandingLookup[c.id] || 0
  }));

  res.status(200).json({ success: true, message: 'All customers report (Optimized)', data });
});

// @desc    Get billing trends report
// @route   GET /api/reports/billing-trends
// @access  Private
exports.getBillingTrends = asyncHandler(async (req, res, next) => {
  const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } }) || 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentRevenue = await Payment.sum('amount', {
    where: {
      status: 'completed',
      payment_date: { [Op.gte]: thirtyDaysAgo }
    }
  }) || 0;

  // Group by month - Handle both SQLite and PostgreSQL
  const dialect = db.sequelize.getDialect();
  let dateGroup;
  if (dialect === 'postgres') {
    dateGroup = [db.sequelize.fn('to_char', db.sequelize.col('payment_date'), 'YYYY-MM'), 'month'];
  } else {
    dateGroup = [db.sequelize.fn('strftime', '%Y-%m', db.sequelize.col('payment_date')), 'month'];
  }

  const trendDataRaw = await Payment.findAll({
    where: { status: 'completed' },
    attributes: [
      dateGroup,
      [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'revenue']
    ],
    group: ['month'],
    order: [[db.sequelize.literal('month'), 'ASC']]
  });

  const trendData = trendDataRaw.map(data => ({
    month: data.dataValues.month,
    revenue: parseFloat(data.dataValues.revenue)
  }));

  res.status(200).json({
    success: true,
    message: 'Billing trends report',
    data: {
      totalRevenue,
      recentRevenue,
      trendData
    }
  });
});

// @desc    Get outstanding dues report
// @route   GET /api/reports/outstanding-dues
// @access  Private
exports.getOutstandingDues = asyncHandler(async (req, res, next) => {
  const outstanding = await Invoice.findAll({
    where: {
      status: { [Op.in]: ['pending', 'overdue'] }
    },
    include: [{
      model: Bill,
      include: [{ model: Customer, attributes: ['name'] }]
    }]
  });

  const outstandingFormatted = outstanding.map(invoice => ({
    ...invoice.toJSON(),
    customerName: invoice.Bill?.Customer?.name
  }));

  res.status(200).json({ success: true, message: 'Outstanding dues report', data: outstandingFormatted });
});

// @desc    Generate financial summary
// @route   POST /api/reports/financial-summary
// @access  Private
exports.generateFinancialSummary = asyncHandler(async (req, res, next) => {
  const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } }) || 0;
  const totalOutstanding = await Invoice.sum('amountDue', { where: { status: { [Op.in]: ['pending', 'overdue'] } } }) || 0;

  res.status(200).json({
    success: true,
    message: 'Financial summary report',
    data: {
      totalRevenue,
      totalOutstanding,
      reportGenerated: new Date(),
    }
  });
});

// @desc    Get usage reports
// @route   GET /api/reports/usage-reports
// @access  Private
exports.getUsageReports = asyncHandler(async (req, res, next) => {
  const totalUsageDuration = await UsageLog.sum('duration') || 0;
  const usageTrends = await getUsageTrendData();

  res.status(200).json({
    success: true,
    message: 'Usage reports',
    data: {
      totalUsageDuration,
      usageTrends,
    }
  });
});

// @desc    Generate detailed financial report
// @route   GET /api/reports/detailed-financial-report
// @access  Private
exports.generateDetailedFinancialReport = asyncHandler(async (req, res, next) => {
  const transactions = await Payment.findAll({
    include: [
      { model: Customer, attributes: ['name'] },
      { model: Bill, include: [{ model: Invoice, attributes: ['invoiceNumber'] }] }
    ],
    order: [['payment_date', 'DESC']]
  });

  const invoices = await Invoice.findAll({
    include: [
      { model: Bill, include: [{ model: Customer, attributes: ['name'] }] }
    ],
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

// @desc    Get customer usage trend
// @route   GET /api/reports/customer-usage-trend
// @access  Private
exports.getCustomerUsageTrend = asyncHandler(async (req, res, next) => {
  const customers = await Customer.findAll({ attributes: ['id', 'name'] });

  const trends = await Promise.all(customers.map(async customer => {
    const usageTrend = await getUsageTrendData(customer.id);
    return {
      customerId: customer.id,
      customerName: customer.name,
      usageTrend: usageTrend
    };
  }));

  res.status(200).json({ success: true, message: 'Customer usage trend report', data: trends });
});

// @desc    Get top customers by spending
// @route   GET /api/reports/top-customers
// @access  Private
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
    include: [{ model: Customer, attributes: ['name'] }]
  });

  const topCustomersFormatted = customerSpending.map(cs => ({
    customerId: cs.customerId,
    customerName: cs.Customer?.name,
    totalSpent: parseFloat(cs.dataValues.totalSpent)
  }));

  res.status(200).json({ success: true, message: 'Top customers report', data: topCustomersFormatted });
});
