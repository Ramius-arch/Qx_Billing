// backend/models/BusinessProfile.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BusinessProfile = sequelize.define('BusinessProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    businessName: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: 'Universal Enterprise'
    },
    legalEntity: {
      type: DataTypes.STRING(120),
      allowNull: true
    },
    taxId: {
      type: DataTypes.STRING(60),
      allowNull: true,
      comment: 'e.g. KRA PIN, VAT Number, EIN'
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'KES'
    },
    currencySymbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'KES'
    },
    taxName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'VAT'
    },
    taxRate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.16 // e.g. 0.16 for 16%
    },
    pricesIncludeTax: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    archetype: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'retail', // 'retail', 'saas', 'services', 'usage'
      comment: 'Primary business operational model'
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(80),
      defaultValue: 'Kenya'
    },
    settlementAccountCode: {
      type: DataTypes.STRING(20),
      defaultValue: '1020',
      comment: 'Primary clearing GL account code for incoming receipts'
    },
    isConfigured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether initial business canvas setup has been completed'
    },
    mode: {
      type: DataTypes.STRING(30),
      defaultValue: 'poc_benchmark', // 'poc_benchmark' | 'live_private'
      comment: 'Operational mode: PoC benchmark demo vs private owner live ledger'
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON serialized business rules (e.g. shipping zones, payment gateways, custom parameters)'
    }
  }, {
    timestamps: true
  });

  return BusinessProfile;
};
