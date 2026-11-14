const Joi = require('joi');

// Retail CRM: a shopkeeper should be able to save a customer with just a name
// and an M-Pesa number. Plan (telecom legacy) and address are optional.
const customerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    phone_number: Joi.string()
        .trim()
        .pattern(/^[+\d][\d\s-]{6,19}$/)
        .required()
        .messages({ 'string.pattern.base': 'Phone number should look like 0712 345 678 or +254 712 345 678' }),
    email: Joi.string().email().allow(null, ''),
    address: Joi.string().allow(null, '').max(500),
    planId: Joi.number().integer().allow(null).optional(),
    status: Joi.string().valid('active', 'inactive', 'suspended', 'archived').optional(),
}).unknown(true); // tolerate read-only fields (insights, Plan, timestamps) echoed back by the UI

module.exports = {
    customerSchema,
};
