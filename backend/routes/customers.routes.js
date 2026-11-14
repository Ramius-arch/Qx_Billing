// backend/routes/customers.routes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/Customers/customer_contoller');

const validate = require('../middleware/validate');
const { customerSchema } = require('../middleware/schemas/customer.schema');

// NOTE: these routes are not yet behind authentication. The app has no real
// login (the frontend issues a placeholder session token and no endpoint signs
// JWTs), so applying the `auth` middleware here would reject every request.
// See the auth follow-up before exposing this API publicly.

router.get('/', customerController.getCustomers);
router.get('/:id/summary', customerController.getCustomerSummary);
router.get('/:id', customerController.getCustomerById);
router.post('/', validate(customerSchema), customerController.createCustomer);
router.put('/:id', validate(customerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
