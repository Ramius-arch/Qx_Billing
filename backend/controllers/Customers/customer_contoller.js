const { ErrorResponse } = require('../../middleware/errorHandler');
const asyncHandler = require('../../middleware/asyncHandler');
const db = require('../../models');
const { clearCache } = require('../../middleware/cacheHandler');
const ladhaService = require('../../services/ladhaService');
const {
  computeInsights,
  suggestNextStep,
  SEGMENT_LABELS
} = require('../../services/customerInsights');
const Customer = db.Customer;
const Plan = db.Plan;
const { Op } = db.Sequelize;

// Columns a caller may sort by. Computed insight fields are sorted in memory.
const SORTABLE_FIELDS = ['id', 'name', 'phone_number', 'createdAt', 'lifetimeSpend', 'lastPurchaseAt', 'balanceDue', 'orderCount'];
const SEGMENT_FILTERS = [...Object.keys(SEGMENT_LABELS), 'owes_money'];

const EDITABLE_FIELDS = ['name', 'phone_number', 'email', 'address', 'planId', 'status'];

// Copy only editable fields, and store phone numbers in one Kenyan format
// (2547XXXXXXXX) so the same shopper typed as 0712..., +254 712... or 712...
// is recognised as one customer.
const normalizeCustomerPayload = (body) => {
  const data = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  if (data.name) data.name = String(data.name).trim();
  if (data.phone_number) data.phone_number = ladhaService.normalizePhone(data.phone_number);
  if (data.planId === '') data.planId = null;
  if (data.email === '') data.email = null;
  return data;
};

const DATE_FIELDS = ['createdAt', 'lastPurchaseAt'];

// Empty values always sort last, regardless of direction.
const sortRows = (rows, field, direction) => {
  const valueOf = (row) => {
    const v = row.insights[field] !== undefined ? row.insights[field] : row[field];
    if (v === null || v === undefined) return null;
    return DATE_FIELDS.includes(field) ? new Date(v).getTime() : v;
  };
  return rows.sort((a, b) => {
    const av = valueOf(a);
    const bv = valueOf(b);
    if (av === bv) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;
    const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return cmp * direction;
  });
};

// @desc    Get all customers with CRM insights (spend, recency, owed, segment)
// @route   GET /api/customers?search=&segment=&sortBy=&sortOrder=&page=&pageSize=
// @access  Private
//
// Insights are computed for every customer matching the search, so segment
// filters, segment counts and "sort by spend/owed" work across all pages.
// This is fine at small-business scale (thousands of customers); beyond that
// these figures should be materialised into a table.
const getCustomers = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    pageSize = 10,
    search,
    segment,
    includeArchived,
    sortBy = 'id',
    sortOrder = 'asc'
  } = req.query;

  const limit = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 200);
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);
  const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'id';
  const direction = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;

  if (segment && !SEGMENT_FILTERS.includes(segment)) {
    return next(new ErrorResponse(`Unknown segment "${segment}"`, 400));
  }

  const whereClause = {};
  if (includeArchived !== 'true') {
    whereClause.status = { [Op.ne]: 'archived' };
  }
  if (search) {
    const normalizedPhone = ladhaService.normalizePhone(search);
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { phone_number: { [Op.like]: `%${search}%` } },
      { address: { [Op.like]: `%${search}%` } },
    ];
    if (normalizedPhone && normalizedPhone !== search) {
      whereClause[Op.or].push({ phone_number: { [Op.like]: `%${normalizedPhone}%` } });
    }
  }

  const matching = await Customer.findAll({
    where: whereClause,
    include: [{ model: Plan, attributes: ['name', 'price'] }]
  });

  const insights = await computeInsights(matching);

  const segmentCounts = { all: matching.length, owes_money: 0 };
  Object.keys(SEGMENT_LABELS).forEach(k => { segmentCounts[k] = 0; });

  let rows = matching.map(c => {
    const insight = insights.get(c.id);
    segmentCounts[insight.segment] += 1;
    if (insight.owesMoney) segmentCounts.owes_money += 1;
    return { ...c.toJSON(), insights: insight };
  });

  if (segment === 'owes_money') {
    rows = rows.filter(r => r.insights.owesMoney);
  } else if (segment) {
    rows = rows.filter(r => r.insights.segment === segment);
  }

  sortRows(rows, sortField, direction);

  const totalItems = rows.length;
  const paged = rows.slice((currentPage - 1) * limit, currentPage * limit);

  res.status(200).json({
    success: true,
    totalItems,
    customers: paged,
    segmentCounts,
    currentPage,
    totalPages: Math.ceil(totalItems / limit)
  });
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findByPk(req.params.id, {
    include: [{
      model: Plan,
      attributes: ['name', 'price']
    }]
  });

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Customer 360: profile, insights, purchases, payments and open bills
// @route   GET /api/customers/:id/summary
// @access  Private
const getCustomerSummary = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findByPk(req.params.id, {
    include: [{ model: Plan, attributes: ['name', 'price'] }]
  });

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  const [insightMap, orders, payments, openInvoices] = await Promise.all([
    computeInsights([customer]),
    db.Order.findAll({
      where: { customerId: customer.id },
      include: [{ model: db.OrderLine, as: 'lines', attributes: ['title', 'quantity', 'unitPrice', 'lineTotal'] }],
      order: [['createdAt', 'DESC']],
      limit: 25
    }),
    db.Payment.findAll({
      where: { customerId: customer.id },
      order: [['payment_date', 'DESC']],
      limit: 25
    }),
    db.Invoice.findAll({
      where: { customerId: customer.id, status: { [Op.in]: ['pending', 'overdue'] } },
      order: [['dueDate', 'ASC']],
      limit: 25
    })
  ]);

  const insights = insightMap.get(customer.id);
  const firstName = (customer.name || '').split(' ')[0] || 'This customer';

  res.status(200).json({
    success: true,
    data: {
      customer,
      insights: { ...insights, nextStep: suggestNextStep(insights, firstName) },
      orders,
      payments,
      openInvoices
    }
  });
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res, next) => {
  const customerData = normalizeCustomerPayload(req.body);

  if (customerData.phone_number) {
    const existing = await Customer.findOne({ where: { phone_number: customerData.phone_number } });
    if (existing) {
      return next(new ErrorResponse(`A customer with this phone number already exists (${existing.name}).`, 409));
    }
  }

  const customer = await Customer.create(customerData);
  clearCache('/api/reports*');
  res.status(201).json({
    success: true,
    data: customer
  });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res, next) => {
  let customer = await Customer.findByPk(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  const updates = normalizeCustomerPayload(req.body);

  if (updates.phone_number && updates.phone_number !== customer.phone_number) {
    const clash = await Customer.findOne({ where: { phone_number: updates.phone_number, id: { [Op.ne]: customer.id } } });
    if (clash) {
      return next(new ErrorResponse(`Another customer already uses this phone number (${clash.name}).`, 409));
    }
  }

  await customer.update(updates);

  // Re-fetch to get any updated fields
  customer = await Customer.findByPk(req.params.id);
  clearCache('/api/reports*');

  res.status(200).json({
    success: true,
    data: customer
  });
});

// @desc    Archive customer (kept for purchase and payment history)
// @route   DELETE /api/customers/:id
// @access  Private
//
// Customers are archived, not erased: their orders, payments and invoices
// must stay attached for the books and for KRA records.
const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findByPk(req.params.id);

  if (!customer) {
    return next(new ErrorResponse(`Customer not found with id of ${req.params.id}`, 404));
  }

  await customer.update({ status: 'archived' });
  clearCache('/api/reports*');

  res.status(200).json({
    success: true,
    data: { id: customer.id, status: 'archived' }
  });
});

module.exports = {
  getCustomers,
  getCustomerById,
  getCustomerSummary,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
