const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    billId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Changed from false to true
      references: {
        model: 'Bill',
        key: 'id'
      }
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true, // Can be generated later
      unique: true
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    amountDue: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    pdfPath: {
      type: DataTypes.STRING,
      allowNull: true // Path to the generated PDF invoice
    },
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false
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
  return Invoice;
};
