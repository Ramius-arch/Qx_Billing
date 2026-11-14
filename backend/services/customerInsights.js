// backend/services/customerInsights.js
//
// Customer 360 insights for the retail CRM.
// Derives lifetime spend, purchase recency, money owed and a plain-language
// segment for each customer from the Orders and Invoices already in the ledger.
// No schema changes: everything is computed from existing tables.

const db = require('../models');
const { Op, fn, col } = db.Sequelize;

// Thresholds are deliberately simple so a shopkeeper can understand them.
const SEGMENT_RULES = {
  VIP_SPEND: 20000,   // KES lifetime spend to count as VIP
  LAPSING_DAYS: 60,   // no purchase for this long => lapsing
  NEW_DAYS: 30        // first purchase within this window => new
};

// Order statuses that represent money actually received.
const SETTLED_ORDER_STATUSES = ['paid', 'fulfilled'];
// Order / invoice statuses that represent money still owed.
const OPEN_ORDER_STATUSES = ['pending'];
const OPEN_INVOICE_STATUSES = ['pending', 'overdue'];

const SEGMENT_LABELS = {
  vip: 'VIP',
  regular: 'Regular',
  new: 'New',
  lapsing: 'Lapsing',
  no_purchases: 'No purchases yet'
};

const DAY_MS = 24 * 60 * 60 * 1000;

const daysBetween = (from, to) => Math.floor((to - new Date(from)) / DAY_MS);

/**
 * Pure classification so it can be unit-tested without a database.
 * Priority: no purchases -> lapsing -> vip -> new -> regular.
 * Lapsing comes before VIP because a lapsing VIP is the most urgent to win back.
 */
function classifySegment({ orderCount, lifetimeSpend, firstPurchaseAt, lastPurchaseAt }, now = new Date()) {
  if (!orderCount || !lastPurchaseAt) return 'no_purchases';
  if (daysBetween(lastPurchaseAt, now) > SEGMENT_RULES.LAPSING_DAYS) return 'lapsing';
  if (lifetimeSpend >= SEGMENT_RULES.VIP_SPEND) return 'vip';
  if (firstPurchaseAt && daysBetween(firstPurchaseAt, now) <= SEGMENT_RULES.NEW_DAYS) return 'new';
  return 'regular';
}

/**
 * One plain-language next step for the shopkeeper, shown on the profile page.
 */
function suggestNextStep(insight, firstName = 'This customer') {
  if (insight.balanceDue > 0) {
    return `${firstName} owes KES ${Math.round(insight.balanceDue).toLocaleString('en-KE')}. Send a friendly WhatsApp reminder.`;
  }
  switch (insight.segment) {
    case 'lapsing':
      return `${firstName} hasn't bought in ${insight.daysSinceLastPurchase} days. A WhatsApp message with a new arrival could bring them back.`;
    case 'vip':
      return `${firstName} is one of your best customers. Give them first look at new stock.`;
    case 'new':
      return `${firstName} is new. A thank-you message now makes a second visit more likely.`;
    case 'no_purchases':
      return `${firstName} is registered but hasn't bought yet. Invite them to visit the shop.`;
    default:
      return `${firstName} buys regularly. Keep them updated when new stock arrives.`;
  }
}

const toNumber = (v) => (v === null || v === undefined ? 0 : Number(v) || 0);

/**
 * Aggregate insights for many customers in a handful of grouped queries.
 * @param {Array<{id:number}>} customers
 * @returns {Promise<Map<number, object>>}
 */
async function computeInsights(customers, now = new Date()) {
  const ids = customers.map(c => c.id);
  const result = new Map();
  if (ids.length === 0) return result;

  const [settled, openOrders, openInvoices] = await Promise.all([
    db.Order.findAll({
      attributes: [
        'customerId',
        [fn('SUM', col('total')), 'spend'],
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('MIN', col('createdAt')), 'firstPurchaseAt'],
        [fn('MAX', col('createdAt')), 'lastPurchaseAt']
      ],
      where: { customerId: { [Op.in]: ids }, status: { [Op.in]: SETTLED_ORDER_STATUSES } },
      group: ['customerId'],
      raw: true
    }),
    db.Order.findAll({
      attributes: ['customerId', [fn('SUM', col('total')), 'owed']],
      where: { customerId: { [Op.in]: ids }, status: { [Op.in]: OPEN_ORDER_STATUSES } },
      group: ['customerId'],
      raw: true
    }),
    db.Invoice.findAll({
      attributes: ['customerId', [fn('SUM', col('amountDue')), 'owed']],
      where: { customerId: { [Op.in]: ids }, status: { [Op.in]: OPEN_INVOICE_STATUSES } },
      group: ['customerId'],
      raw: true
    })
  ]);

  const settledBy = new Map(settled.map(r => [Number(r.customerId), r]));
  const openOrdersBy = new Map(openOrders.map(r => [Number(r.customerId), toNumber(r.owed)]));
  const openInvoicesBy = new Map(openInvoices.map(r => [Number(r.customerId), toNumber(r.owed)]));

  for (const c of customers) {
    const s = settledBy.get(c.id);
    const orderCount = s ? toNumber(s.orderCount) : 0;
    const lifetimeSpend = s ? Math.round(toNumber(s.spend) * 100) / 100 : 0;
    const firstPurchaseAt = s ? s.firstPurchaseAt : null;
    const lastPurchaseAt = s ? s.lastPurchaseAt : null;
    const balanceDue = Math.round(((openOrdersBy.get(c.id) || 0) + (openInvoicesBy.get(c.id) || 0)) * 100) / 100;
    const segment = classifySegment({ orderCount, lifetimeSpend, firstPurchaseAt, lastPurchaseAt }, now);

    result.set(c.id, {
      lifetimeSpend,
      orderCount,
      averageOrderValue: orderCount ? Math.round(lifetimeSpend / orderCount) : 0,
      firstPurchaseAt,
      lastPurchaseAt,
      daysSinceLastPurchase: lastPurchaseAt ? daysBetween(lastPurchaseAt, now) : null,
      balanceDue,
      owesMoney: balanceDue > 0,
      segment,
      segmentLabel: SEGMENT_LABELS[segment]
    });
  }
  return result;
}

module.exports = {
  SEGMENT_RULES,
  SEGMENT_LABELS,
  SETTLED_ORDER_STATUSES,
  OPEN_ORDER_STATUSES,
  OPEN_INVOICE_STATUSES,
  classifySegment,
  suggestNextStep,
  computeInsights
};
