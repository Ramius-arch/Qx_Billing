const { ErrorHandler } = require('../../utlis/errorHandler');
const Joi = require('joi');
const db = require('../../models'); // Import models from the centralized index.js
const Customer = db.Customer;
const Plan = db.Plan;

async function getCustomers(req, res) {
  try {
    const { page = 1, pageSize = 10, search, sortBy = 'id', sortOrder = 'asc' } = req.query;
    const limit = parseInt(pageSize, 10);
    const offset = (parseInt(page, 10) - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.like]: `%${search}%` } },
        { email: { [db.Sequelize.Op.like]: `%${search}%` } },
        { phone_number: { [db.Sequelize.Op.like]: `%${search}%` } },
        { address: { [db.Sequelize.Op.like]: `%${search}%` } },
      ];
    }

    const orderClause = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await Customer.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: limit,
      offset: offset,
      include: [{
        model: Plan,
        attributes: ['name', 'price']
      }]
    });

    return res.status(200).json({
      totalItems: count,
      customers: rows,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch customers' });
  }
}

async function getCustomerById(req, res) {
  try {
    const { id } = req.params;
    const customer = await Customer.findByPk(parseInt(id), {
      include: [{
        model: Plan,
        attributes: ['name', 'price']
      }]
    });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch customer details' });
  }
}

async function createCustomer(req, res) {
  try {
    const { name, phone_number, email, address, planId, status } = req.body;
    
    const validationSchema = Joi.object({
      name: Joi.string().required(),
      phone_number: Joi.string().required(),
      email: Joi.string().email().optional(),
      address: Joi.string().required(),
      planId: Joi.number().integer().required(),
      status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
    });

    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newCustomer = await Customer.create({
      name,
      phone_number,
      email,
      address,
      planId,
      status: status || 'active',
    });
    return res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to create customer' });
  }
}

async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const [updatedRows] = await Customer.update(req.body, {
      where: { id: parseInt(id) }
    });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Customer not found or no changes made' });
    }

    const updatedCustomer = await Customer.findByPk(parseInt(id));
    return res.status(200).json(updatedCustomer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update customer' });
  }
}

async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const deletedRows = await Customer.destroy({
      where: { id: parseInt(id) }
    });

    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.status(204).send(); // No content for successful deletion
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to delete customer' });
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
