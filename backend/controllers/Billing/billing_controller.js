const { ErrorHandler } = require('../../utlis/errorHandler');
const db = require('../../models'); // Import models from the centralized index.js
const Customer = db.Customer;
const Plan = db.Plan;
const UsageLog = db.UsageLog;
const Bill = db.Bill;
const Invoice = db.Invoice;
const { Op } = require('sequelize');

// Helper function to calculate charges based on unbilled usage
async function calculateCustomerCharges(customerId) {
  console.log(`[calculateCustomerCharges] - Starting for customerId: ${customerId}`);
  const customer = await Customer.findByPk(customerId, {
    include: [{ model: Plan }]
  });
  console.log(`[calculateCustomerCharges] - Fetched customer: ${customer ? customer.toJSON() : 'N/A'}`); // Log full customer object

  if (!customer) {
    throw new Error('Customer not found for billing calculation.');
  }
  console.log(`[calculateCustomerCharges] - Customer planId: ${customer.planId}`);
  if (!customer.Plan) {
    throw new Error(`Customer ${customerId} has no associated Plan for billing calculation.`);
  }

  const customerPlanId = customer.planId;
  console.log(`[calculateCustomerCharges] - Customer Plan ID: ${customerPlanId}, Plan Price: ${customer.Plan.price}, Call Rate: ${customer.Plan.callRate}, Data Rate: ${customer.Plan.dataRate}, SMS Rate: ${customer.Plan.smsRate}`);

  const unbilledUsageLogs = await UsageLog.findAll({
    where: {
      customerId: customerId,
      billed: false, // Only consider unbilled usage
    }
  });
  console.log(`[calculateCustomerCharges] - Found ${unbilledUsageLogs.length} unbilled usage logs.`);

  let totalCharges = 0;
  // Add base plan price (monthly fee)
  totalCharges += customer.Plan.price;
  console.log(`[calculateCustomerCharges] - Initial totalCharges (from plan price): ${totalCharges}`);

  for (const log of unbilledUsageLogs) {
    switch (log.usageType) {
      case 'call':
        totalCharges += log.duration * (customer.Plan.callRate || 0);
        break;
      case 'data':
        totalCharges += log.duration * (customer.Plan.dataRate || 0);
        break;
      case 'sms':
        totalCharges += log.duration * (customer.Plan.smsRate || 0);
        break;
      default:
        console.warn(`[calculateCustomerCharges] - Unknown usage type: ${log.usageType} for log ID: ${log.id}`);
    }
  }
  console.log(`[calculateCustomerCharges] - Final totalCharges (with usage): ${totalCharges}`);

  return { totalCharges, unbilledUsageLogs, customer, customerPlanId };
}

async function calculateCharges(req, res) {
  try {
    const { customerId } = req.params;
    console.log(`[calculateCharges] - Request for customerId: ${customerId}`);
    const { totalCharges } = await calculateCustomerCharges(parseInt(customerId));

    return res.status(200).json({ totalCharges });
  } catch (error) {
    console.error(`[calculateCharges] - Error: ${error.message}`, error);
    return res.status(500).json({ error: error.message || 'Failed to calculate charges' });
  }
}

async function generateBill(req, res) {
  try {
    const { customerId } = req.params;
    console.log(`[generateBill] - Request for customerId: ${customerId}`);

    // Call helper to get charges, usage logs, customer, and planId
    const { totalCharges, unbilledUsageLogs, customer, customerPlanId } = await calculateCustomerCharges(parseInt(customerId));
    console.log(`[generateBill] - Calculated totalCharges: ${totalCharges}, customerPlanId: ${customerPlanId}`);

    // Validate customerPlanId before creating Bill
    if (!customerPlanId) {
      throw new Error(`Cannot generate bill: Customer ${customerId} does not have a valid planId.`);
    }

    // Create a new Bill record
    const newBill = await Bill.create({
      customerId: parseInt(customerId),
      planId: customerPlanId,
      amount: totalCharges,
      date: new Date(),
    });
    console.log(`[generateBill] - Created Bill with ID: ${newBill.id}`);

    // Create an associated Invoice record
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(issueDate.getDate() + 30); // Due in 30 days

    const newInvoice = await Invoice.create({
      billId: newBill.id,
      customerId: parseInt(customerId),
      invoiceNumber: `INV-${newBill.id}-${Date.now()}`,
      issueDate: issueDate,
      dueDate: dueDate,
      amountDue: totalCharges,
      status: 'pending',
    });
    console.log(`[generateBill] - Created Invoice with ID: ${newInvoice.id}`);

    // Mark associated UsageLogs as billed only if there are any
    if (unbilledUsageLogs && unbilledUsageLogs.length > 0) {
      await UsageLog.update(
        { billed: true },
        { where: { id: { [Op.in]: unbilledUsageLogs.map(log => log.id) } } }
      );
      console.log(`[generateBill] - Marked ${unbilledUsageLogs.length} usage logs as billed.`);
    } else {
      console.log('[generateBill] - No unbilled usage logs to mark as billed.');
    }
    
    return res.status(201).json({
      message: 'Bill and Invoice generated successfully',
      bill: newBill,
      invoice: newInvoice,
    });
  } catch (error) {
    console.error(`[generateBill] - Error: ${error.message}`, error);
    return res.status(500).json({ error: error.message || 'Failed to generate bill' });
  }
}

module.exports = {
  calculateCharges,
  generateBill,
};
