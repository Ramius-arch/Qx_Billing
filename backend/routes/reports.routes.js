// backend/routes/reports.routes.js
const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/Reports/report_controller');
const { cacheMiddleware } = require('../middleware/cacheHandler');

// Middleware for authentication
const auth = require('../middleware/auth');

router.get('/customers', cacheMiddleware(3600), reportsController.getAllCustomers);
router.get('/billing-trends', cacheMiddleware(3600), reportsController.getBillingTrends);
router.get('/outstanding-dues', cacheMiddleware(3600), reportsController.getOutstandingDues);
router.post('/financial-summary', reportsController.generateFinancialSummary);
router.get('/usage-reports', cacheMiddleware(3600), reportsController.getUsageReports);

// Route for generating detailed financial reports
router.get('/detailed-financial-report', cacheMiddleware(3600), reportsController.generateDetailedFinancialReport);
router.get('/customer-usage-trend', cacheMiddleware(3600), reportsController.getCustomerUsageTrend);
router.get('/top-customers', cacheMiddleware(3600), reportsController.getTopCustomers);

module.exports = router;
