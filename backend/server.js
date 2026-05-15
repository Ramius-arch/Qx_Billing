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
db.sequelize.sync({ alter: true }) // Use { alter: true } to update tables without dropping data
    .then(() => {
        console.log('Database synchronized');
        // seedDatabase(); // Uncomment once if you need initial demo data
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to synchronize database:', err);
        process.exit(1);
    });

async function seedDatabase() {
    const generateDemoData = require('./services/demoData');
    const { customers, plans, bills, payments, usageLogs, invoices, reports } = generateDemoData();
    try {
        await db.Plan.bulkCreate(plans, { ignoreDuplicates: true });
        await db.Customer.bulkCreate(customers, { ignoreDuplicates: true });
        await db.Bill.bulkCreate(bills, { ignoreDuplicates: true });
        await db.Payment.bulkCreate(payments, { ignoreDuplicates: true });
        await db.UsageLog.bulkCreate(usageLogs, { ignoreDuplicates: true });
        await db.Invoice.bulkCreate(invoices, { ignoreDuplicates: true });
        await db.Report.bulkCreate(reports, { ignoreDuplicates: true });
        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Failed to seed database:', error);
    }
}

module.exports = app;