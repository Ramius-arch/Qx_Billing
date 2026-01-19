const { ErrorHandler } = require('../../utlis/errorHandler');
const db = require('../../models'); // Import models from the centralized index.js
const Invoice = db.Invoice;
const Bill = db.Bill;
const Customer = db.Customer;
const Plan = db.Plan;

async function getInvoices(req, res) {
  try {
    const invoices = await Invoice.findAll({
      include: [{
        model: Bill,
        include: [
          { model: Customer, attributes: ['name', 'email'] },
          { model: Plan, attributes: ['name'] }
        ]
      }]
    });
    return res.status(200).json(invoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}

async function getInvoiceById(req, res) {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(parseInt(id), {
      include: [{
        model: Bill,
        include: [
          { model: Customer, attributes: ['name', 'email'] },
          { model: Plan, attributes: ['name'] }
        ]
      }]
    });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    return res.status(200).json(invoice);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
}

async function updateInvoiceStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const [updatedRows] = await Invoice.update({ status, updatedAt: new Date() }, {
      where: { id: parseInt(id) }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Invoice not found or no changes made' });
    }

    const updatedInvoice = await Invoice.findByPk(parseInt(id));
    return res.status(200).json({ message: 'Invoice status updated successfully', invoice: updatedInvoice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update invoice status' });
  }
}

async function generateInvoice(req, res) {
  try {
    const { billId, dueDate, amountDue } = req.body;
    if (!billId || !dueDate || !amountDue) {
      return res.status(400).json({ error: 'Missing required invoice generation details' });
    }
    const bill = await Bill.findByPk(parseInt(billId));
    if (!bill) {
        return res.status(404).json({ error: 'Bill not found for invoice generation' });
    }

    const newInvoice = await Invoice.create({
      billId: parseInt(billId),
      invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Generate a unique invoice number
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      amountDue: parseFloat(amountDue),
      pdfPath: null, // PDF path will be updated after generation
      status: 'pending',
    });
    return res.status(201).json({ message: 'Invoice generated successfully', invoice: newInvoice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate invoice' });
  }
}

async function getInvoicesForCustomer(req, res) {
  try {
    const customerId = req.user && req.user.id ? req.user.id : null; // Assuming customerId from authenticated user

    if (!customerId) {
      return res.status(401).json({ error: 'Authentication required to fetch customer invoices' });
    }

    const invoices = await Invoice.findAll({
      include: [{
        model: Bill,
        include: [
          { model: Customer, where: { id: customerId }, attributes: ['name', 'email'] },
          { model: Plan, attributes: ['name'] }
        ]
      }]
    });

    // Filter out invoices where the customer include failed (due to the where clause)
    const customerInvoices = invoices.filter(invoice => invoice.Bill && invoice.Bill.Customer);

    return res.status(200).json(customerInvoices);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch customer invoices' });
  }
}

async function generatePDF(req, res) {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findByPk(parseInt(id));
    if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found for PDF generation' });
    }
    // Placeholder for PDF generation logic (e.g., using a PDF library)
    const pdfPath = `/path/to/generated/invoices/invoice_${invoice.invoiceNumber}.pdf`;
    await Invoice.update({ pdfPath }, { where: { id: invoice.id } });

    return res.status(200).json({ message: `PDF for invoice ${id} generated successfully.`, pdfPath: pdfPath });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}

module.exports = {
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  generateInvoice,
  getInvoicesForCustomer,
  generatePDF,
};