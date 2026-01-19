// backend/models/Payment.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    receipt_number: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customer',
        key: 'id'
      }
    },
    billId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Bill',
        key: 'id'
      }
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
  return Payment;
};
