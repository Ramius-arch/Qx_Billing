// backend/routes/invoices.routes.js
const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/Invoices/invoice_contoller');

// Middleware for authentication and authorization
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminMiddleware');

router.get('/', invoicesController.getInvoices);
router.get('/:id', invoicesController.getInvoiceById);
router.put('/:id/status', invoicesController.updateInvoiceStatus);
router.post('/generate-invoice', invoicesController.generateInvoice);

// Route for customers to view their invoice
router.get('/me', async (req, res) => {
  try {
    const invoice = await invoicesController.getInvoices(1);
    res.status(200).json({
      status: 'success',
      data: invoice,
      message: 'Invoice retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Route for generating and downloading PDF invoices
router.get('/:id/download-pdf', async (req, res) => {
  try {
    const invoice = await invoicesController.generatePDF(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { pdfContent: invoice },
      message: 'Invoice PDF generated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

module.exports = router;
