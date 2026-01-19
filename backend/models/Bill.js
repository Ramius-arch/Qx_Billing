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
        model: 'Customer',
        key: 'id'
      }
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Plan',
        key: 'id'
      }
    },
    usageLogs: {
      type: DataTypes.JSON,
      allowNull: true
    },
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
      type: DataTypes.ENUM(' unpaid', 'paid', 'pending'),
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
