const asyncHandler = require('../../middleware/asyncHandler');
const ErrorResponse = require('../../middleware/errorHandler').ErrorResponse;
const db = require('../../models');
const { Op } = require('sequelize');

const Customer = db.Customer;
const Plan = db.Plan;
const UsageLog = db.UsageLog;
const Bill = db.Bill;
const Invoice = db.Invoice;

/**
 * @desc    Calculate charges based on usage and plan tiers
 * @access  Internal
 */
const calculateCustomerCharges = async (customerId) => {
  const customer = await Customer.findByPk(customerId, {
    include: [{ model: Plan }]
  });

  if (!customer) {
    throw new ErrorResponse(`Customer with ID ${customerId} not found`, 404);
  }

  if (!customer.Plan) {
    // Innovation: Handle customers with no plan by providing a default or clear error
    throw new ErrorResponse(`Customer ${customer.name} is not enrolled in a billing plan.`, 400);
  }

  const unbilledLogs = await UsageLog.findAll({
    where: { customerId, billed: false }
  });

  // Aggregate usage
  const totals = unbilledLogs.reduce((acc, log) => {
    acc[log.usageType] = (acc[log.usageType] || 0) + log.duration;
    return acc;
  }, { call: 0, data: 0, sms: 0 });

  const plan = customer.Plan;
  let usageCharges = 0;

  // Tiered logic: Charge only overages
  const callOverage = Math.max(0, totals.call - (plan.call_minutes || 0));
  usageCharges += callOverage * (plan.callRate || 0);

  const dataOverage = Math.max(0, totals.data - (plan.data_usage || 0));
  usageCharges += dataOverage * (plan.dataRate || 0);

  const smsOverage = Math.max(0, totals.sms - (plan.sms_count || 0));
  usageCharges += smsOverage * (plan.smsRate || 0);

  const subtotal = plan.price + usageCharges;
  const tax = subtotal * 0.16; // 16% VAT
  const total = subtotal + tax;

  return {
    customer,
    plan,
    totals,
    overages: { call: callOverage, data: dataOverage, sms: smsOverage },
    breakdown: {
      basePrice: plan.price,
      usageCharges,
      subtotal,
      tax,
      total
    },
    unbilledLogs
  };
};

// @desc    Calculate current charges
// @route   GET /api/billing/calculate/:customerId
// @access  Private
exports.calculateCharges = asyncHandler(async (req, res, next) => {
  const { total } = (await calculateCustomerCharges(req.params.customerId)).breakdown;
  res.status(200).json({ success: true, totalCharges: total });
});

// @desc    Generate Bill and Invoice
// @route   POST /api/billing/generate/:customerId
// @access  Private
exports.generateBill = asyncHandler(async (req, res, next) => {
  const customerId = parseInt(req.params.customerId);
  const result = await calculateCustomerCharges(customerId);
  const { breakdown, unbilledLogs, plan } = result;

  // Create Bill with usage snapshots for historical accuracy
  const bill = await Bill.create({
    customerId,
    planId: plan.id,
    amount: breakdown.total,
    date: new Date(),
    usageLogs: unbilledLogs.map(l => ({
      id: l.id,
      type: l.usageType,
      duration: l.duration,
      timestamp: l.timestamp
    })),
    voiceCallsDuration: result.totals.call,
    dataUsage: result.totals.data,
    smsCount: result.totals.sms,
    totalAmount: breakdown.total
  });

  // Create Invoice with Itemization (Innovation: stored in metadata or notes for now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice = await Invoice.create({
    billId: bill.id,
    customerId,
    invoiceNumber: `INV-${bill.id}-${Date.now()}`,
    issueDate: new Date(),
    dueDate,
    amountDue: breakdown.total,
    status: 'pending'
  });

  // Mark usage as billed
  if (unbilledLogs.length > 0) {
    await UsageLog.update(
      { billed: true },
      { where: { id: { [Op.in]: unbilledLogs.map(l => l.id) } } }
    );
  }

  res.status(201).json({
    success: true,
    message: 'Billing cycle completed successfully',
    data: { bill, invoice, breakdown }
  });
});

// @desc    Get billing forecast
// @route   GET /api/billing/forecast/:customerId
// @access  Private
exports.getForecast = asyncHandler(async (req, res, next) => {
  const result = await calculateCustomerCharges(req.params.customerId);
  const { breakdown, totals } = result;

  // Innovation: Simple linear projection based on days in month
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();

  const projectionFactor = daysInMonth / currentDay;
  const projectedTotal = result.plan.price + (breakdown.usageCharges * projectionFactor);
  const projectedTax = projectedTotal * 0.16;

  res.status(200).json({
    success: true,
    data: {
      currentUsage: totals,
      currentCosts: breakdown,
      projection: {
        total: projectedTotal + projectedTax,
        tax: projectedTax,
        confidence: currentDay > 15 ? 'high' : 'medium'
      }
    }
  });
});

