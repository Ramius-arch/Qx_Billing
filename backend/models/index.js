const { Sequelize } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize({
    dialect: dbConfig.db.dialect,
    storage: dbConfig.db.storage,
    logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import all models
db.Customer = require('./Customer')(sequelize);
db.Plan = require('./Plan')(sequelize);
db.Bill = require('./Bill')(sequelize);
db.Payment = require('./Payment')(sequelize);
db.UsageLog = require('./UsageLog')(sequelize);
db.Invoice = require('./Invoice')(sequelize);
db.Report = require('./Report')(sequelize);

// Set up model associations
// Associations should ideally be defined within each model file's `associate` method
// but explicitly defined here for clarity if not present in models.
// If your models have an associate method, uncomment and use the following:
// Object.keys(db).forEach(modelName => {
//     if (db[modelName].associate) {
//         db[modelName].associate(db);
//     }
// });

// Explicit associations extracted from server.js
db.Customer.hasMany(db.Bill, { foreignKey: 'customerId' });
db.Bill.belongsTo(db.Customer, { foreignKey: 'customerId' });

db.Customer.belongsTo(db.Plan, { foreignKey: 'planId' });
db.Plan.hasMany(db.Customer, { foreignKey: 'planId' });

db.Bill.belongsTo(db.Plan, { foreignKey: 'planId' });
db.Plan.hasMany(db.Bill, { foreignKey: 'planId' });

db.UsageLog.belongsTo(db.Customer, { foreignKey: 'customerId', constraints: true });
db.UsageLog.belongsTo(db.Plan, { foreignKey: 'planId', constraints: true });
db.Customer.hasMany(db.UsageLog, { foreignKey: 'customerId' });
db.Plan.hasMany(db.UsageLog, { foreignKey: 'planId' });

db.Payment.belongsTo(db.Customer, { foreignKey: 'customerId' });
db.Customer.hasMany(db.Payment, { foreignKey: 'customerId' });

db.Payment.belongsTo(db.Bill, { foreignKey: 'billId' });
db.Bill.hasMany(db.Payment, { foreignKey: 'billId' });

db.Invoice.belongsTo(db.Bill, { foreignKey: 'billId' });
db.Bill.hasMany(db.Invoice, { foreignKey: 'billId' });

db.Report.belongsTo(db.Customer, { foreignKey: 'customerId' });
db.Customer.hasMany(db.Report, { foreignKey: 'customerId' });


module.exports = db;