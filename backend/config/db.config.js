require('dotenv').config();

module.exports = {
  db: {
    dialect: 'sqlite',
    storage: ':memory:'
  },
};
