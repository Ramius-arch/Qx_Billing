// backend/models/Customer.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone_number: {
      type: DataTypes.STRING(20), // Could be international number with country code
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Plan',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
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
  return Customer;
};
