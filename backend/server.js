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

const { errorHandler } = require('./middleware/errorHandler');

// Use routes
app.use('/api/customers', customerRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/billing', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);

// Error handler (should be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
db.sequelize.sync({ force: true }) // Use { force: true } to drop and re-create tables
    .then(() => {
        console.log('Database synchronized');
        seedDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to synchronize database:', err);
        process.exit(1); // Exit process if database sync fails
    });

async function seedDatabase() {
    const generateDemoData = require('./services/demoData');
    const { customers, plans, bills, payments, usageLogs, invoices, reports } = generateDemoData();
    try {
        // Temporarily disable foreign key checks
        await db.sequelize.query('PRAGMA foreign_keys = OFF;');

        await db.Plan.bulkCreate(plans);
        await db.Customer.bulkCreate(customers);
        await db.Bill.bulkCreate(bills);
        await db.Payment.bulkCreate(payments);
        await db.UsageLog.bulkCreate(usageLogs);
        await db.Invoice.bulkCreate(invoices);
        await db.Report.bulkCreate(reports);
        console.log('Database seeded successfully!');

        // Re-enable foreign key checks
        await db.sequelize.query('PRAGMA foreign_keys = ON;');
    } catch (error) {
        console.error('Failed to seed database:', error);
    }
}

module.exports = app;