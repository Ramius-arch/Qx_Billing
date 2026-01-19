const express = require('express');
const router = express.Router();
const billingController = require('../controllers/Billing/billing_controller');

router.post('/generate/:customerId', billingController.generateBill);
router.get('/charges/:customerId', billingController.calculateCharges);

module.exports = router;
