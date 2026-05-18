// backend/models/Bill.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Bill = sequelize.define('Bill', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Plans',
        key: 'id'
      }
    },
    // Optimization: Removed redundant usageLogs JSON field. 
    // Usage details should be queried directly from the UsageLog table to prevent bloat.
    voiceCallsDuration: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    dataUsage: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    smsCount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    paymentStatus: {
      type: DataTypes.ENUM('unpaid', 'paid', 'pending'),
      defaultValue: 'unpaid'
    },
    invoicePdfUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: () => new Date()
    }
  });
  return Bill;
};
