// backend/models/Order.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true // e.g. ORD-1001-XYZ
    },
    storeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'private-store'
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Customers',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'fulfilled', 'cancelled', 'refunded'),
      defaultValue: 'paid',
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    shippingTotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    taxTotal: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    total: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0
    },
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    customerPhone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    customerEmail: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      defaultValue: 'cash'
    },
    paymentReceipt: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    journalEntryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'JournalEntries',
        key: 'id'
      }
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  return Order;
};
