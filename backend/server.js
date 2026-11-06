const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dbConfig = require('./config/db.config'); // Import database configuration
const db = require('./models'); // Import all models and sequelize instance from index.js

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Import routes
const customerRoutes = require('./routes/customers.routes');
const planRoutes = require('./routes/plans.routes');
const billRoutes = require('./routes/billing.routes');
const paymentRoutes = require('./routes/payments.routes');
const usageRoutes = require('./routes/usage.routes');
const invoiceRoutes = require('./routes/invoices.routes');
const reportRoutes = require('./routes/reports.routes');
const healthRoutes = require('./routes/health.routes');
const configRoutes = require('./routes/config.routes');
const ledgerRoutes = require('./routes/ledger.routes');
const gatewayRoutes = require('./routes/gateway.routes');
const dukaRoutes = require('./routes/duka.routes');

const { errorHandler } = require('./middleware/errorHandler');

// Use routes
app.use('/api/customers', customerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/billing', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/config', configRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/v1/gateway', gatewayRoutes);
app.use('/api', dukaRoutes);

// Error handler (should be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// In development, we use 'force: true' to ensure a clean state for seeding
// In test mode, tests manage database lifecycle and seeding independently
if (!isTest) {
    db.sequelize.sync({ force: !isProduction }) 
        .then(async () => {
            console.log('Database synchronized');
            await seedDatabase(); // Seed database with initial demo data
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('Failed to synchronize database:', err);
            process.exit(1);
        });
}

async function seedDatabase() {
    const generateDemoData = require('./services/demoData');
    const ledgerService = require('./services/ledgerService');
    const { customers, plans, bills, payments, usageLogs, invoices, reports } = generateDemoData();
    try {
        await db.Plan.bulkCreate(plans, { ignoreDuplicates: true });
        await db.Customer.bulkCreate(customers, { ignoreDuplicates: true });
        await db.Bill.bulkCreate(bills, { ignoreDuplicates: true });
        await db.Payment.bulkCreate(payments, { ignoreDuplicates: true });
        await db.UsageLog.bulkCreate(usageLogs, { ignoreDuplicates: true });
        await db.Invoice.bulkCreate(invoices, { ignoreDuplicates: true });
        await db.Report.bulkCreate(reports, { ignoreDuplicates: true });

        // Seed Business Profile & Initial General Ledger Chart of Accounts
        await ledgerService.ensureAccounts();
        console.log('Database seeded successfully (including Universal General Ledger)!');
    } catch (error) {
        console.error('Failed to seed database:', error);
    }
}

module.exports = app;
