// backend/routes/reports.routes.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/Reports/report_controller');

// Middleware for authentication
const auth = require('../middleware/auth');

router.get('/customers', reportsController.getAllCustomers);
router.get('/billing-trends', reportsController.getBillingTrends);
router.get('/outstanding-dues', reportsController.getOutstandingDues);
router.post('/financial-summary', reportsController.generateFinancialSummary);
router.get('/usage-reports', reportsController.getUsageReports);

// Route for generating detailed financial reports
router.get('/detailed-financial-report', reportsController.generateDetailedFinancialReport);
router.get('/customer-usage-trend', reportsController.getCustomerUsageTrend);
router.get('/top-customers', reportsController.getTopCustomers);

module.exports = router;
