const { ErrorHandler } = require('../../utlis/errorHandler');
const db = require('../../models'); // Import models from the centralized index.js
const { Op } = require('sequelize'); // Import Op for operators
const Customer = db.Customer;
const UsageLog = db.UsageLog;
const Invoice = db.Invoice;
const Payment = db.Payment;
const Bill = db.Bill;
const Report = db.Report; // Although reports themselves can be generated and stored if needed

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
  const usageLogs = await UsageLog.findAll({
    where: whereClause,
    attributes: ['timestamp', 'duration'],
    order: [['timestamp', 'ASC']]
  });

  const trendData = {};
  usageLogs.forEach(log => {
    const date = log.timestamp.toISOString().split('T')[0];
    if (!trendData[date]) {
      trendData[date] = 0;
    }
    trendData[date] += log.duration;
  });

  return Object.keys(trendData).map(date => ({ date, value: trendData[date] }));
}

async function getAllCustomers(req, res) {
  try {
    const customers = await Customer.findAll({
      attributes: ['id', 'name', 'email']
    });

    const customersWithData = await Promise.all(customers.map(async customer => {
      const totalUsage = await calculateMonthlyUsage(customer.id);
      const outstandingInvoices = await Invoice.sum('amountDue', {
        where: {
          customerId: customer.id,
          status: { [Op.in]: ['pending', 'overdue'] }
        }
      }) || 0;

      return {
        ...customer.toJSON(),
        totalUsage: totalUsage,
        outstandingInvoices: outstandingInvoices
      };
    }));
    return res.status(200).json({ message: 'All customers report', data: customersWithData });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get all customers report' });
  }
}

async function getBillingTrends(req, res) {
  try {
    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } }) || 0;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRevenue = await Payment.sum('amount', {
      where: {
        status: 'completed',
        payment_date: { [Op.gte]: thirtyDaysAgo }
      }
    }) || 0;

    // Example trend data (can be more complex with grouping by month etc.)
    const trendDataRaw = await Payment.findAll({
        where: { status: 'completed' },
        attributes: [
            [db.sequelize.fn('strftime', '%Y-%m', db.sequelize.col('payment_date')), 'month'],
            [db.sequelize.fn('SUM', db.sequelize.col('amount')), 'revenue']
        ],
        group: ['month'],
        order: [[db.sequelize.literal('month'), 'ASC']]
    });
    const trendData = trendDataRaw.map(data => ({ month: data.dataValues.month, revenue: parseFloat(data.dataValues.revenue) }));


    return res.status(200).json({
        message: 'Billing trends report',
        data: {
            totalRevenue,
            recentRevenue,
            trendData
        }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get billing trends report' });
  }
}

async function getOutstandingDues(req, res) {
  try {
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

    return res.status(200).json({ message: 'Outstanding dues report', data: outstandingFormatted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get outstanding dues report' });
  }
}

async function generateFinancialSummary(req, res) {
  try {
    const totalRevenue = await Payment.sum('amount', { where: { status: 'completed' } }) || 0;
    const totalOutstanding = await Invoice.sum('amountDue', { where: { status: { [Op.in]: ['pending', 'overdue'] } } }) || 0;

    return res.status(200).json({
        message: 'Financial summary report',
        data: {
            totalRevenue,
            totalOutstanding,
            reportGenerated: new Date(),
        }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate financial summary report' });
  }
}

async function getUsageReports(req, res) {
  try {
    const totalUsageDuration = await UsageLog.sum('duration') || 0;

    const usageTrends = await getUsageTrendData(); // For all customers or aggregated
    // If you need per-customer trends, it would be 'await getUsageTrendData(customerId)' within a loop or grouped query

    return res.status(200).json({
      message: 'Usage reports',
      data: {
        totalUsageDuration,
        usageTrends,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get usage reports' });
  }
}

async function generateDetailedFinancialReport(req, res) {
  try {
    const transactions = await Payment.findAll({
      include: [
        { model: Customer, attributes: ['name'] },
        { model: Bill, include: [{ model: Invoice, attributes: ['invoiceNumber'] }] } // Assuming bill to invoice relation
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
            invoiceNumber: p.Bill?.Invoice?.invoiceNumber // Accessing through Bill
        })),
        invoices: invoices.map(i => ({
            ...i.toJSON(),
            customerName: i.Bill?.Customer?.name
        }))
    };
    return res.status(200).json({ message: 'Detailed financial report', data: detailedReport });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate detailed financial report' });
  }
}

async function getCustomerUsageTrend(req, res) {
  try {
    const customers = await Customer.findAll({ attributes: ['id', 'name'] });

    const trends = await Promise.all(customers.map(async customer => {
        const usageTrend = await getUsageTrendData(customer.id);
        return {
            customerId: customer.id,
            customerName: customer.name,
            usageTrend: usageTrend
        };
    }));
    return res.status(200).json({ message: 'Customer usage trend report', data: trends });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get customer usage trend report' });
  }
}

async function getTopCustomers(req, res) {
  try {
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
        customerName: cs.Customer.name,
        totalSpent: parseFloat(cs.dataValues.totalSpent)
    }));

    return res.status(200).json({ message: 'Top customers report', data: topCustomersFormatted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to get top customers report' });
  }
}


module.exports = {
  getAllCustomers,
  getBillingTrends,
  getOutstandingDues,
  generateFinancialSummary,
  getUsageReports,
  generateDetailedFinancialReport,
  getCustomerUsageTrend,
  getTopCustomers,
};
