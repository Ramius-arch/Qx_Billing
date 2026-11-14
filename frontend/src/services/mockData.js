/**
 * Qx / Ladha Ledger — Autonomous Client-Side Data Store
 * Mirrors the Kenyan SME Retail CRM & Double-Entry backend when offline.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgoIso = (days) => new Date(Date.now() - days * DAY_MS).toISOString();

const STORAGE_KEYS = {
  CUSTOMERS: 'qx_mock_customers_v2',
  INVOICES: 'qx_mock_invoices_v2',
  ORDERS: 'qx_mock_orders_v2',
  PAYMENTS: 'qx_mock_payments_v2',
};

const SEGMENT_RULES = {
  VIP_SPEND: 20000,
  LAPSING_DAYS: 60,
  NEW_DAYS: 30,
};

const SEGMENT_LABELS = {
  vip: 'VIP',
  regular: 'Regular',
  new: 'New',
  lapsing: 'Lapsing',
  no_purchases: 'No purchases yet',
};

export function normalizeKenyanPhone(phone) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '254' + digits.slice(1);
  } else if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
    digits = '254' + digits;
  }
  return digits;
}

const daysBetween = (from, to = Date.now()) => Math.floor((to - new Date(from).getTime()) / DAY_MS);

function classifySegment({ orderCount, lifetimeSpend, firstPurchaseAt, lastPurchaseAt }) {
  if (!orderCount || !lastPurchaseAt) return 'no_purchases';
  if (daysBetween(lastPurchaseAt) > SEGMENT_RULES.LAPSING_DAYS) return 'lapsing';
  if (lifetimeSpend >= SEGMENT_RULES.VIP_SPEND) return 'vip';
  if (firstPurchaseAt && daysBetween(firstPurchaseAt) <= SEGMENT_RULES.NEW_DAYS) return 'new';
  return 'regular';
}

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

const DEFAULT_PLANS = [
  { id: 1, name: 'Starter Duka Tier', price: 1500 },
  { id: 2, name: 'Growth Retail Tier', price: 3500 },
  { id: 3, name: 'Wholesale Enterprise', price: 8500 },
];

const DEFAULT_CUSTOMERS = [
  { id: 1, name: 'Kevin Ochieng', email: 'kevin@nairobihardware.co.ke', phone_number: '254712334556', address: 'Kilimani, Nairobi', status: 'active', planId: 3, Plan: DEFAULT_PLANS[2], createdAt: daysAgoIso(120) },
  { id: 2, name: 'Amina Wangari', email: 'amina@westlandshomes.co.ke', phone_number: '254722984102', address: 'Westlands, Nairobi', status: 'active', planId: 3, Plan: DEFAULT_PLANS[2], createdAt: daysAgoIso(114) },
  { id: 3, name: 'Brian Mutua', email: 'brian@mutuatraders.co.ke', phone_number: '254733112450', address: 'River Road, Nairobi CBD', status: 'active', planId: 3, Plan: DEFAULT_PLANS[2], createdAt: daysAgoIso(108) },
  { id: 4, name: 'Faith Chebet', email: 'faith@chebetagro.co.ke', phone_number: '254701556778', address: 'Lavington, Nairobi', status: 'active', planId: 2, Plan: DEFAULT_PLANS[1], createdAt: daysAgoIso(102) },
  { id: 5, name: 'Samuel Kamau', email: 'samuel@kamausupplies.co.ke', phone_number: '254720441982', address: 'Githurai 45, Kiambu', status: 'active', planId: 2, Plan: DEFAULT_PLANS[1], createdAt: daysAgoIso(96) },
  { id: 6, name: 'Mercy Wanjiku', email: 'mercy@southbmart.co.ke', phone_number: '254798223104', address: 'South B, Nairobi', status: 'active', planId: 1, Plan: DEFAULT_PLANS[0], createdAt: daysAgoIso(9) },
  { id: 7, name: 'Dennis Kiprop', email: 'dennis@eldoretfeeds.co.ke', phone_number: '254715889012', address: 'Langas, Eldoret', status: 'active', planId: 2, Plan: DEFAULT_PLANS[1], createdAt: daysAgoIso(18) },
  { id: 8, name: 'Zainab Hassan', email: 'zainab@nyaliboutique.co.ke', phone_number: '254724667890', address: 'Nyali, Mombasa', status: 'active', planId: 1, Plan: DEFAULT_PLANS[0], createdAt: daysAgoIso(15) },
  { id: 9, name: 'Peter Njoroge', email: 'peter@ruakabuilders.co.ke', phone_number: '254711903421', address: 'Ruaka, Kiambu', status: 'active', planId: 2, Plan: DEFAULT_PLANS[1], createdAt: daysAgoIso(25) },
  { id: 10, name: 'Grace Akinyi', email: 'grace@kisumuchemists.co.ke', phone_number: '254728345611', address: 'Milimani, Kisumu', status: 'active', planId: 1, Plan: DEFAULT_PLANS[0], createdAt: daysAgoIso(110) },
  { id: 11, name: 'Josephat Mwangi', email: 'josephat@thikaauto.co.ke', phone_number: '254721774320', address: 'Makongeni, Thika', status: 'active', planId: 3, Plan: DEFAULT_PLANS[2], createdAt: daysAgoIso(68) },
  { id: 12, name: 'Esther Wambui', email: 'esther@syokimaufresh.co.ke', phone_number: '254745118903', address: 'Syokimau, Machakos', status: 'active', planId: 2, Plan: DEFAULT_PLANS[1], createdAt: daysAgoIso(55) },
];

const DEFAULT_ORDERS = [
  {
    id: 101, orderNumber: 'QX-1001', customerName: 'Kevin Ochieng', customerId: 1,
    total: 23300, totalAmount: 23300, subtotal: 23000, shippingTotal: 300, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHK8R2P101', mpesaReceipt: 'SHK8R2P101',
    createdAt: daysAgoIso(42),
    lines: [
      { title: 'Inverter Battery 100Ah', quantity: 1, unitPrice: 18500, lineTotal: 18500 },
      { title: 'Solar Lantern Pro 12W', quantity: 1, unitPrice: 4500, lineTotal: 4500 },
    ],
    items: [{ name: 'Inverter Battery 100Ah', qty: 1, price: 18500 }, { name: 'Solar Lantern Pro 12W', qty: 1, price: 4500 }],
  },
  {
    id: 102, orderNumber: 'QX-1002', customerName: 'Kevin Ochieng', customerId: 1,
    total: 8550, totalAmount: 8550, subtotal: 8260, shippingTotal: 290, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHJ4N9W302', mpesaReceipt: 'SHJ4N9W302',
    createdAt: daysAgoIso(6),
    lines: [
      { title: '20L Cooking Oil Jerrycan', quantity: 1, unitPrice: 5800, lineTotal: 5800 },
      { title: '50kg Cement (Bamburi Nguvu)', quantity: 3, unitPrice: 820, lineTotal: 2460 },
    ],
    items: [{ name: '20L Cooking Oil Jerrycan', qty: 1, price: 5800 }, { name: '50kg Cement (Bamburi Nguvu)', qty: 3, price: 820 }],
  },
  {
    id: 103, orderNumber: 'QX-1003', customerName: 'Amina Wangari', customerId: 2,
    total: 23400, totalAmount: 23400, subtotal: 23000, shippingTotal: 400, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHG2T7V603', mpesaReceipt: 'SHG2T7V603',
    createdAt: daysAgoIso(48),
    lines: [{ title: 'Water Tank 1000L (Roto)', quantity: 2, unitPrice: 11500, lineTotal: 23000 }],
    items: [{ name: 'Water Tank 1000L (Roto)', qty: 2, price: 11500 }],
  },
  {
    id: 104, orderNumber: 'QX-1004', customerName: 'Amina Wangari', customerId: 2,
    total: 23600, totalAmount: 23600, subtotal: 23300, shippingTotal: 300, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHF9M1B404', mpesaReceipt: 'SHF9M1B404',
    createdAt: daysAgoIso(3),
    lines: [
      { title: 'Inverter Battery 100Ah', quantity: 1, unitPrice: 18500, lineTotal: 18500 },
      { title: 'LED Floodlight 50W', quantity: 2, unitPrice: 2400, lineTotal: 4800 },
    ],
    items: [{ name: 'Inverter Battery 100Ah', qty: 1, price: 18500 }, { name: 'LED Floodlight 50W', qty: 2, price: 2400 }],
  },
  {
    id: 105, orderNumber: 'QX-1005', customerName: 'Brian Mutua', customerId: 3,
    total: 23600, totalAmount: 23600, subtotal: 23400, shippingTotal: 200, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHE6C5D805', mpesaReceipt: 'SHE6C5D805',
    createdAt: daysAgoIso(78),
    lines: [
      { title: 'Inverter Battery 100Ah', quantity: 1, unitPrice: 18500, lineTotal: 18500 },
      { title: 'Pishori Rice 25kg Bag', quantity: 1, unitPrice: 4900, lineTotal: 4900 },
    ],
    items: [{ name: 'Inverter Battery 100Ah', qty: 1, price: 18500 }, { name: 'Pishori Rice 25kg Bag', qty: 1, price: 4900 }],
  },
  {
    id: 106, orderNumber: 'QX-1006', customerName: 'Faith Chebet', customerId: 4,
    total: 6650, totalAmount: 6650, subtotal: 6400, shippingTotal: 250, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHD3X8K206', mpesaReceipt: 'SHD3X8K206',
    createdAt: daysAgoIso(54),
    lines: [{ title: 'Hybrid Maize Seed 10kg', quantity: 2, unitPrice: 3200, lineTotal: 6400 }],
    items: [{ name: 'Hybrid Maize Seed 10kg', qty: 2, price: 3200 }],
  },
  {
    id: 107, orderNumber: 'QX-1007', customerName: 'Faith Chebet', customerId: 4,
    total: 7400, totalAmount: 7400, subtotal: 7150, shippingTotal: 250, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHC7Y4H907', mpesaReceipt: 'SHC7Y4H907',
    createdAt: daysAgoIso(11),
    lines: [
      { title: 'Solar Lantern Pro 12W', quantity: 1, unitPrice: 4500, lineTotal: 4500 },
      { title: 'Dairy Meal 50kg Bag', quantity: 1, unitPrice: 2650, lineTotal: 2650 },
    ],
    items: [{ name: 'Solar Lantern Pro 12W', qty: 1, price: 4500 }, { name: 'Dairy Meal 50kg Bag', qty: 1, price: 2650 }],
  },
  {
    id: 108, orderNumber: 'QX-1008', customerName: 'Samuel Kamau', customerId: 5,
    total: 9540, totalAmount: 9540, subtotal: 9140, shippingTotal: 400, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHB1Q6G308', mpesaReceipt: 'SHB1Q6G308',
    createdAt: daysAgoIso(46),
    lines: [
      { title: 'Mabati Gauge 30 (3m Sheet)', quantity: 6, unitPrice: 1250, lineTotal: 7500 },
      { title: '50kg Cement (Bamburi Nguvu)', quantity: 2, unitPrice: 820, lineTotal: 1640 },
    ],
    items: [{ name: 'Mabati Gauge 30 (3m Sheet)', qty: 6, price: 1250 }, { name: '50kg Cement (Bamburi Nguvu)', qty: 2, price: 820 }],
  },
  {
    id: 109, orderNumber: 'QX-1009', customerName: 'Mercy Wanjiku', customerId: 6,
    total: 4750, totalAmount: 4750, subtotal: 4500, shippingTotal: 250, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SHA5L2F809', mpesaReceipt: 'SHA5L2F809',
    createdAt: daysAgoIso(4),
    lines: [{ title: 'Solar Lantern Pro 12W', quantity: 1, unitPrice: 4500, lineTotal: 4500 }],
    items: [{ name: 'Solar Lantern Pro 12W', qty: 1, price: 4500 }],
  },
  {
    id: 110, orderNumber: 'QX-1010', customerName: 'Dennis Kiprop', customerId: 7,
    total: 6300, totalAmount: 6300, subtotal: 5800, shippingTotal: 500, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SGZ9K4N110', mpesaReceipt: 'SGZ9K4N110',
    createdAt: daysAgoIso(12),
    lines: [{ title: '20L Cooking Oil Jerrycan', quantity: 1, unitPrice: 5800, lineTotal: 5800 }],
    items: [{ name: '20L Cooking Oil Jerrycan', qty: 1, price: 5800 }],
  },
  {
    id: 111, orderNumber: 'QX-1011', customerName: 'Dennis Kiprop', customerId: 7,
    total: 2700, totalAmount: 2700, subtotal: 2400, shippingTotal: 300, status: 'pending',
    paymentMethod: 'mpesa', paymentReceipt: null, mpesaReceipt: null,
    createdAt: daysAgoIso(2),
    lines: [{ title: 'LED Floodlight 50W', quantity: 1, unitPrice: 2400, lineTotal: 2400 }],
    items: [{ name: 'LED Floodlight 50W', qty: 1, price: 2400 }],
  },
  {
    id: 112, orderNumber: 'QX-1012', customerName: 'Peter Njoroge', customerId: 9,
    total: 6500, totalAmount: 6500, subtotal: 6250, shippingTotal: 250, status: 'pending',
    paymentMethod: 'mpesa', paymentReceipt: null, mpesaReceipt: null,
    createdAt: daysAgoIso(5),
    lines: [{ title: 'Mabati Gauge 30 (3m Sheet)', quantity: 5, unitPrice: 1250, lineTotal: 6250 }],
    items: [{ name: 'Mabati Gauge 30 (3m Sheet)', qty: 5, price: 1250 }],
  },
  {
    id: 113, orderNumber: 'QX-1013', customerName: 'Grace Akinyi', customerId: 10,
    total: 5400, totalAmount: 5400, subtotal: 4900, shippingTotal: 500, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SGX2M9P313', mpesaReceipt: 'SGX2M9P313',
    createdAt: daysAgoIso(94),
    lines: [{ title: 'Pishori Rice 25kg Bag', quantity: 1, unitPrice: 4900, lineTotal: 4900 }],
    items: [{ name: 'Pishori Rice 25kg Bag', qty: 1, price: 4900 }],
  },
  {
    id: 114, orderNumber: 'QX-1014', customerName: 'Josephat Mwangi', customerId: 11,
    total: 21900, totalAmount: 21900, subtotal: 21500, shippingTotal: 400, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SGW7R4K114', mpesaReceipt: 'SGW7R4K114',
    createdAt: daysAgoIso(22),
    lines: [
      { title: 'Water Tank 1000L (Roto)', quantity: 1, unitPrice: 11500, lineTotal: 11500 },
      { title: 'Mabati Gauge 30 (3m Sheet)', quantity: 8, unitPrice: 1250, lineTotal: 10000 },
    ],
    items: [{ name: 'Water Tank 1000L (Roto)', qty: 1, price: 11500 }, { name: 'Mabati Gauge 30 (3m Sheet)', qty: 8, price: 1250 }],
  },
  {
    id: 115, orderNumber: 'QX-1015', customerName: 'Esther Wambui', customerId: 12,
    total: 11000, totalAmount: 11000, subtotal: 10700, shippingTotal: 300, status: 'paid',
    paymentMethod: 'mpesa', paymentReceipt: 'SGV3N8Q215', mpesaReceipt: 'SGV3N8Q215',
    createdAt: daysAgoIso(38),
    lines: [
      { title: '20L Cooking Oil Jerrycan', quantity: 1, unitPrice: 5800, lineTotal: 5800 },
      { title: 'Pishori Rice 25kg Bag', quantity: 1, unitPrice: 4900, lineTotal: 4900 },
    ],
    items: [{ name: '20L Cooking Oil Jerrycan', qty: 1, price: 5800 }, { name: 'Pishori Rice 25kg Bag', qty: 1, price: 4900 }],
  },
];

const DEFAULT_INVOICES = [
  { id: 1, invoiceNumber: 'INV-QX-1001', customerName: 'Kevin Ochieng', customerId: 1, amount: 23300, amountDue: 23300, status: 'paid', dueDate: daysAgoIso(42).slice(0, 10), createdAt: daysAgoIso(42) },
  { id: 2, invoiceNumber: 'INV-CR-1001', customerName: 'Kevin Ochieng', customerId: 1, amount: 8500, amountDue: 8500, status: 'overdue', dueDate: daysAgoIso(4).slice(0, 10), createdAt: daysAgoIso(18) },
  { id: 3, invoiceNumber: 'INV-CR-1002', customerName: 'Samuel Kamau', customerId: 5, amount: 3200, amountDue: 3200, status: 'pending', dueDate: daysAgoIso(-5).slice(0, 10), createdAt: daysAgoIso(9) },
  { id: 4, invoiceNumber: 'INV-QX-1003', customerName: 'Amina Wangari', customerId: 2, amount: 23400, amountDue: 23400, status: 'paid', dueDate: daysAgoIso(48).slice(0, 10), createdAt: daysAgoIso(48) },
  { id: 5, invoiceNumber: 'INV-QX-1005', customerName: 'Brian Mutua', customerId: 3, amount: 23600, amountDue: 23600, status: 'paid', dueDate: daysAgoIso(78).slice(0, 10), createdAt: daysAgoIso(78) },
];

const DEFAULT_ACCOUNTS = [
  { id: 1, code: '1100', name: 'M-Pesa Clearing & Settlement', type: 'asset', debit: 164040, credit: 0, balance: 164040 },
  { id: 2, code: '1200', name: 'Accounts Receivable (Shoppers)', type: 'asset', debit: 20900, credit: 0, balance: 20900 },
  { id: 3, code: '2200', name: 'KRA Output VAT Payable (16%)', type: 'liability', debit: 0, credit: 25508.97, balance: 25508.97 },
  { id: 4, code: '4000', name: 'Sales Revenue - Retail Store', type: 'revenue', debit: 0, credit: 155241.03, balance: 155241.03 },
  { id: 5, code: '4100', name: 'Courier & Logistics Tariffs Income', type: 'revenue', debit: 0, credit: 4190, balance: 4190 },
];

function getStored(key, defaultVal) {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
}

function setStored(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

function computeCustomerInsight(customerId, orders, invoices) {
  const settled = orders.filter((o) => o.customerId === customerId && ['paid', 'fulfilled'].includes(o.status));
  const openOrders = orders.filter((o) => o.customerId === customerId && o.status === 'pending');
  const openInvs = invoices.filter((inv) => inv.customerId === customerId && ['pending', 'overdue'].includes(inv.status));

  const orderCount = settled.length;
  const lifetimeSpend = Math.round(settled.reduce((sum, o) => sum + Number(o.total || o.totalAmount || 0), 0) * 100) / 100;
  const timestamps = settled.map((o) => new Date(o.createdAt).getTime()).sort((a, b) => a - b);
  const firstPurchaseAt = timestamps.length ? new Date(timestamps[0]).toISOString() : null;
  const lastPurchaseAt = timestamps.length ? new Date(timestamps[timestamps.length - 1]).toISOString() : null;
  const balanceDue = Math.round(
    (openOrders.reduce((s, o) => s + Number(o.total || o.totalAmount || 0), 0) +
      openInvs.reduce((s, i) => s + Number(i.amountDue ?? i.amount ?? 0), 0)) *
      100
  ) / 100;

  const segment = classifySegment({ orderCount, lifetimeSpend, firstPurchaseAt, lastPurchaseAt });

  return {
    lifetimeSpend,
    orderCount,
    averageOrderValue: orderCount ? Math.round(lifetimeSpend / orderCount) : 0,
    firstPurchaseAt,
    lastPurchaseAt,
    daysSinceLastPurchase: lastPurchaseAt ? daysBetween(lastPurchaseAt) : null,
    balanceDue,
    owesMoney: balanceDue > 0,
    segment,
    segmentLabel: SEGMENT_LABELS[segment],
  };
}

export const MockStore = {
  getCustomers(page = 1, pageSize = 10, search = '', sortBy = 'id', sortOrder = 'asc', segment = '', includeArchived = false) {
    let list = getStored(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    const orders = getStored(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
    const invoices = getStored(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);

    if (!includeArchived) {
      list = list.filter((c) => c.status !== 'archived');
    }

    if (search) {
      const q = search.toLowerCase();
      const normQ = normalizeKenyanPhone(search);
      list = list.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.phone_number && c.phone_number.includes(q)) ||
          (normQ && c.phone_number && c.phone_number.includes(normQ))
      );
    }

    const segmentCounts = { all: list.length, owes_money: 0 };
    Object.keys(SEGMENT_LABELS).forEach((k) => {
      segmentCounts[k] = 0;
    });

    let enriched = list.map((c) => {
      const insights = computeCustomerInsight(c.id, orders, invoices);
      segmentCounts[insights.segment] += 1;
      if (insights.owesMoney) segmentCounts.owes_money += 1;
      return { ...c, insights };
    });

    if (segment === 'owes_money') {
      enriched = enriched.filter((r) => r.insights.owesMoney);
    } else if (segment) {
      enriched = enriched.filter((r) => r.insights.segment === segment);
    }

    const dir = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;
    enriched.sort((a, b) => {
      const av = a.insights?.[sortBy] !== undefined ? a.insights[sortBy] : a[sortBy];
      const bv = b.insights?.[sortBy] !== undefined ? b.insights[sortBy] : b[sortBy];
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });

    const total = enriched.length;
    const start = (page - 1) * pageSize;
    const paginated = enriched.slice(start, start + pageSize);
    return {
      success: true,
      customers: paginated,
      totalItems: total,
      segmentCounts,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  getCustomerSummary(id) {
    const customers = getStored(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    const customer = customers.find((c) => c.id === Number(id));
    if (!customer) {
      const err = new Error('Customer not found');
      err.response = { status: 404, data: { error: 'Customer not found' } };
      throw err;
    }
    const orders = getStored(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS)
      .filter((o) => o.customerId === customer.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const invoices = getStored(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    const insights = computeCustomerInsight(customer.id, orders, invoices);
    const firstName = (customer.name || '').split(' ')[0] || 'This customer';

    const payments = orders
      .filter((o) => ['paid', 'fulfilled'].includes(o.status))
      .map((o, idx) => ({
        id: idx + 1,
        amount: o.total || o.totalAmount,
        payment_date: o.createdAt,
        payment_method: o.paymentMethod || 'mpesa',
        receipt_number: o.paymentReceipt || o.mpesaReceipt,
        status: 'completed',
      }));

    const openInvoices = invoices
      .filter((i) => i.customerId === customer.id && ['pending', 'overdue'].includes(i.status))
      .map((i) => ({ ...i, amountDue: i.amountDue ?? i.amount }));

    return {
      success: true,
      data: {
        customer,
        insights: { ...insights, nextStep: suggestNextStep(insights, firstName) },
        orders,
        payments,
        openInvoices,
      },
    };
  },

  addCustomer(customerData) {
    const list = getStored(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    const normalizedPhone = normalizeKenyanPhone(customerData.phone_number);
    const existing = list.find((c) => normalizeKenyanPhone(c.phone_number) === normalizedPhone);
    if (normalizedPhone && existing) {
      const err = new Error(`A customer with this phone number already exists (${existing.name}).`);
      err.response = { status: 409, data: { error: err.message } };
      throw err;
    }

    const newCust = {
      id: Date.now(),
      status: 'active',
      planId: customerData.planId || null,
      Plan: customerData.planId ? DEFAULT_PLANS.find((p) => p.id === customerData.planId) || null : null,
      createdAt: new Date().toISOString(),
      ...customerData,
      phone_number: normalizedPhone || customerData.phone_number,
    };
    list.unshift(newCust);
    setStored(STORAGE_KEYS.CUSTOMERS, list);
    return { success: true, data: newCust };
  },

  updateCustomer(id, data) {
    let list = getStored(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    const normalizedPhone = data.phone_number ? normalizeKenyanPhone(data.phone_number) : undefined;
    if (normalizedPhone) {
      const clash = list.find((c) => c.id !== Number(id) && normalizeKenyanPhone(c.phone_number) === normalizedPhone);
      if (clash) {
        const err = new Error(`Another customer already uses this phone number (${clash.name}).`);
        err.response = { status: 409, data: { error: err.message } };
        throw err;
      }
    }
    list = list.map((c) =>
      c.id === Number(id) ? { ...c, ...data, ...(normalizedPhone ? { phone_number: normalizedPhone } : {}) } : c
    );
    setStored(STORAGE_KEYS.CUSTOMERS, list);
    return { success: true, data: list.find((c) => c.id === Number(id)) };
  },

  deleteCustomer(id) {
    let list = getStored(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
    list = list.map((c) => (c.id === Number(id) ? { ...c, status: 'archived' } : c));
    setStored(STORAGE_KEYS.CUSTOMERS, list);
    return true;
  },

  getPlans() {
    return DEFAULT_PLANS;
  },

  getInvoices() {
    const list = getStored(STORAGE_KEYS.INVOICES, DEFAULT_INVOICES);
    return { invoices: list, totalItems: list.length };
  },

  getOrders() {
    return getStored(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
  },

  getTrialBalance() {
    const accounts = DEFAULT_ACCOUNTS;
    const totalDebits = accounts.reduce((acc, a) => acc + a.debit, 0);
    const totalCredits = accounts.reduce((acc, a) => acc + a.credit, 0);
    return {
      accounts,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
      variance: 0.0,
    };
  },

  getDashboardData(period = '30d') {
    return {
      period,
      periodLabel: period === '7d' ? 'Last 7 Days (Daily)' : period === '30d' ? 'Last 30 Days (Weekly Velocity)' : 'Last 12 Months',
      totalRevenue: 164040,
      allTimeRevenue: 164040,
      ordersFulfilled: 15,
      averageOrderValue: 10936,
      trendData: [
        { label: 'Week 1', revenue: 21500 },
        { label: 'Week 2', revenue: 32800 },
        { label: 'Week 3', revenue: 44100 },
        { label: 'Week 4', revenue: 65640 },
      ],
      totalDataUsage: 15,
      recentTransactions: [
        { id: 'TX-901', mpesaReceipt: 'SHF9M1B404', customer: 'Amina Wangari', amount: 23600, time: '14 mins ago', status: 'verified' },
        { id: 'TX-902', mpesaReceipt: 'SHA5L2F809', customer: 'Mercy Wanjiku', amount: 4750, time: '1 hour ago', status: 'verified' },
        { id: 'TX-903', mpesaReceipt: 'SHJ4N9W302', customer: 'Kevin Ochieng', amount: 8550, time: '3 hours ago', status: 'verified' },
      ],
      outstandingDuesSummary: [
        { customerName: 'Kevin Ochieng', invoiceNumber: 'INV-CR-1001', amount: 8500, dueDate: daysAgoIso(4).slice(0, 10) },
        { customerName: 'Samuel Kamau', invoiceNumber: 'INV-CR-1002', amount: 3200, dueDate: daysAgoIso(-5).slice(0, 10) },
      ],
      forecast: { projectedMonthly: 185000, growthRate: 18.5 },
    };
  },
};
