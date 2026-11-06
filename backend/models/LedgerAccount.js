// backend/models/LedgerAccount.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LedgerAccount = sequelize.define('LedgerAccount', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true // e.g. '1010', '1200', '2200', '4010'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false // e.g. 'Operating Bank Account', 'Product Sales Revenue'
    },
    type: {
      type: DataTypes.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    archetype: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'core', // 'core', 'retail', 'saas', 'services', 'usage'
      comment: 'Industry archetype this account belongs to'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  return LedgerAccount;
};
