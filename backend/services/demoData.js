// Kenyan SME Retail & Biashara demo dataset for local/staging exploration.
// Keeps the seed fast, deterministic, and aligned with Customer 360 + Double-Entry Ledger.

const pricing = require('./commerce/pricing');

const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days, now = Date.now()) => new Date(now - days * DAY_MS);

const generatePlans = () => [
  {
    id: 1,
    name: 'Starter Duka Tier',
    price: 1500,
    call_minutes: 150,
    sms_count: 100,
    data_usage: 2048,
    callRate: 2.0,
    dataRate: 0.5,
    smsRate: 1.0,
    status: 'active',
    features: { mpesaTill: true, maxSkus: 100 }
  },
  {
    id: 2,
    name: 'Growth Retail Tier',
    price: 3500,
    call_minutes: 400,
    sms_count: 300,
    data_usage: 5120,
    callRate: 1.5,
    dataRate: 0.3,
    smsRate: 0.8,
    status: 'active',
    features: { mpesaTill: true, whatsappReceipts: true, maxSkus: 500 }
  },
  {
    id: 3,
    name: 'Wholesale Enterprise',
    price: 8500,
    call_minutes: 1000,
    sms_count: 1000,
    data_usage: 15360,
    callRate: 1.0,
    dataRate: 0.2,
    smsRate: 0.5,
    status: 'active',
    features: { mpesaTill: true, etims: true, creditControl: true }
  }
];

const CATALOG_ITEMS = [
  { productId: 'SKU-101', title: 'Solar Lantern Pro 12W', unitPrice: 4500 },
  { productId: 'SKU-102', title: 'Inverter Battery 100Ah', unitPrice: 18500 },
  { productId: 'SKU-103', title: 'Water Tank 1000L (Roto)', unitPrice: 11500 },
  { productId: 'SKU-104', title: '20L Cooking Oil Jerrycan', unitPrice: 5800 },
  { productId: 'SKU-105', title: 'Pishori Rice 25kg Bag', unitPrice: 4900 },
  { productId: 'SKU-106', title: 'Mabati Gauge 30 (3m Sheet)', unitPrice: 1250 },
  { productId: 'SKU-107', title: '50kg Cement (Bamburi Nguvu)', unitPrice: 820 },
  { productId: 'SKU-108', title: 'Hybrid Maize Seed 10kg', unitPrice: 3200 },
  { productId: 'SKU-109', title: 'LED Floodlight 50W', unitPrice: 2400 },
  { productId: 'SKU-110', title: 'Dairy Meal 50kg Bag', unitPrice: 2650 }
];

const CURATED_CUSTOMERS = [
  { id: 1, name: 'Kevin Ochieng', phone_number: '254712334556', email: 'kevin@nairobihardware.co.ke', address: 'Kilimani, Nairobi', planId: 3, status: 'active' },
  { id: 2, name: 'Amina Wangari', phone_number: '254722984102', email: 'amina@westlandshomes.co.ke', address: 'Westlands, Nairobi', planId: 3, status: 'active' },
  { id: 3, name: 'Brian Mutua', phone_number: '254733112450', email: 'brian@mutuatraders.co.ke', address: 'River Road, Nairobi CBD', planId: 3, status: 'active' },
  { id: 4, name: 'Faith Chebet', phone_number: '254701556778', email: 'faith@chebetagro.co.ke', address: 'Lavington, Nairobi', planId: 2, status: 'active' },
  { id: 5, name: 'Samuel Kamau', phone_number: '254720441982', email: 'samuel@kamausupplies.co.ke', address: 'Githurai 45, Kiambu', planId: 2, status: 'active' },
  { id: 6, name: 'Mercy Wanjiku', phone_number: '254798223104', email: 'mercy@southbmart.co.ke', address: 'South B, Nairobi', planId: 1, status: 'active' },
  { id: 7, name: 'Dennis Kiprop', phone_number: '254715889012', email: 'dennis@eldoretfeeds.co.ke', address: 'Langas, Eldoret', planId: 2, status: 'active' },
  { id: 8, name: 'Zainab Hassan', phone_number: '254724667890', email: 'zainab@nyaliboutique.co.ke', address: 'Nyali, Mombasa', planId: 1, status: 'active' },
  { id: 9, name: 'Peter Njoroge', phone_number: '254711903421', email: 'peter@ruakabuilders.co.ke', address: 'Ruaka, Kiambu', planId: 2, status: 'active' },
  { id: 10, name: 'Grace Akinyi', phone_number: '254728345611', email: 'grace@kisumuchemists.co.ke', address: 'Milimani, Kisumu', planId: 1, status: 'active' },
  { id: 11, name: 'Josephat Mwangi', phone_number: '254721774320', email: 'josephat@thikaauto.co.ke', address: 'Makongeni, Thika', planId: 3, status: 'active' },
  { id: 12, name: 'Esther Wambui', phone_number: '254745118903', email: 'esther@syokimaufresh.co.ke', address: 'Syokimau, Machakos', planId: 2, status: 'active' }
];

const EXTRA_PROFILES = [
  ['Daniel Kariuki', '254710224811', 'Kasarani, Nairobi'],
  ['Beatrice Muthoni', '254723558120', 'Embakasi, Nairobi'],
  ['Caleb Otieno', '254790114322', 'Kondele, Kisumu'],
  ['Naomi Kerubo', '254714887231', 'Rongai, Kajiado'],
  ['Victor Kibet', '254725993412', 'Nakuru CBD, Nakuru'],
  ['Lucy Njeri', '254716334901', 'Ruiru, Kiambu'],
  ['Hassan Abdullahi', '254729771004', 'Eastleigh, Nairobi'],
  ['Sharon Adhiambo', '254741225678', 'Kileleshwa, Nairobi'],
  ['Patrick Wafula', '254718902344', 'Kitengela, Kajiado'],
  ['Miriam Nyambura', '254726449812', 'Kikuyu, Kiambu'],
  ['George Maina', '254713667123', 'Ngong Town, Kajiado'],
  ['Christine Barasa', '254792338765', 'Mtwapa, Kilifi'],
  ['Stephen Korir', '254727119044', 'Karen, Nairobi'],
  ['Agnes Mwikali', '254748556019', 'Machakos CBD, Machakos'],
  ['Eric Omondi', '254719442087', 'Donholm, Nairobi'],
  ['Salome Jepchirchir', '254722003198', 'Kapsoya, Eldoret'],
  ['Martin Gitonga', '254742881205', 'Juja, Kiambu'],
  ['Pauline Nyokabi', '254734990112', 'Roysambu, Nairobi']
];

const RECEIPT_CODES = [
  'SHK8R2P1MT', 'SHJ4N9W3KL', 'SHG2T7V6QX', 'SHF9M1B4ZR', 'SHE6C5D8LP',
  'SHD3X8K2WN', 'SHC7Y4H9JV', 'SHB1Q6G3PT', 'SHA5L2F8RM', 'SGZ9K4N1BX'
];

const generateDemoData = () => {
  const now = Date.now();
  const plans = generatePlans();
  const planById = new Map(plans.map((p) => [p.id, p]));

  const customers = [
    ...CURATED_CUSTOMERS.map((c, idx) => ({
      ...c,
      createdAt: daysAgo(120 - idx * 6, now),
      updatedAt: daysAgo(Math.max(1, 20 - idx), now)
    })),
    ...EXTRA_PROFILES.map(([name, phone, address], idx) => {
      const id = CURATED_CUSTOMERS.length + idx + 1;
      const slug = name.toLowerCase().replace(/[^a-z]+/g, '.');
      return {
        id,
        name,
        phone_number: phone,
        email: `${slug}@biashara.co.ke`,
        address,
        planId: plans[idx % plans.length].id,
        status: idx === EXTRA_PROFILES.length - 1 ? 'archived' : 'active',
        createdAt: daysAgo(90 - (idx % 45), now),
        updatedAt: daysAgo(1 + (idx % 14), now)
      };
    })
  ];

  const orders = [];
  const orderLines = [];
  const bills = [];
  const invoices = [];
  const payments = [];
  const usageLogs = [];
  const reports = [];

  let orderIdSeq = 1;
  let orderLineIdSeq = 1;
  let billIdSeq = 1;
  let invoiceIdSeq = 1;
  let paymentIdSeq = 1;
  let usageIdSeq = 1;
  let reportIdSeq = 1;

  const customerById = new Map(customers.map((c) => [c.id, c]));

  const pushOrder = (customerId, items, { daysOld, status = 'paid', shippingTotal = 250, method = 'mpesa', notes = null }) => {
    const customer = customerById.get(customerId);
    const id = orderIdSeq++;
    const orderNumber = `QX-${String(1000 + id)}`;
    const createdAt = daysAgo(daysOld, now);
    const normalizedItems = items.map((item) => ({ ...item, quantity: item.quantity || 1 }));
    const subtotal = normalizedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const total = subtotal + shippingTotal;
    const taxTotal = Math.round((total - total / (1 + pricing.VAT_RATE)) * 100) / 100;
    const receipt = status === 'paid'
      ? `${RECEIPT_CODES[(id - 1) % RECEIPT_CODES.length].slice(0, 8)}${String(id).padStart(2, '0')}`
      : null;

    orders.push({
      id,
      orderNumber,
      storeId: 'private-store',
      customerId,
      status,
      currency: 'KES',
      subtotal,
      shippingTotal,
      taxTotal,
      total,
      shippingAddress: customer.address,
      customerName: customer.name,
      customerPhone: customer.phone_number,
      customerEmail: customer.email,
      paymentMethod: method,
      paymentReceipt: receipt,
      journalEntryId: null,
      notes,
      metadata: JSON.stringify({ channel: 'duka-pos' }),
      createdAt,
      updatedAt: createdAt
    });

    normalizedItems.forEach((item) => {
      orderLines.push({
        id: orderLineIdSeq++,
        orderId: id,
        productId: item.productId,
        title: item.title,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        taxRate: pricing.VAT_RATE,
        lineTotal: item.unitPrice * item.quantity,
        metadata: null,
        createdAt,
        updatedAt: createdAt
      });
    });

    if (status === 'paid') {
      payments.push({
        id: paymentIdSeq++,
        amount: total,
        payment_date: createdAt,
        payment_method: method,
        receipt_number: receipt,
        status: 'completed',
        customerId,
        billId: null,
        orderId: id,
        createdAt,
        updatedAt: createdAt
      });

      invoices.push({
        id: invoiceIdSeq++,
        billId: null,
        customerId,
        orderId: id,
        invoiceNumber: `INV-${orderNumber}`,
        issueDate: createdAt,
        dueDate: createdAt,
        amountDue: total,
        pdfPath: null,
        status: 'paid',
        createdAt,
        updatedAt: createdAt
      });
    }
  };

  // Curated archetypes covering all CRM segments & balances out of the box
  // 1: Kevin Ochieng -> VIP + Owes Money (KES 31,400 settled, KES 8,500 overdue credit invoice)
  pushOrder(1, [CATALOG_ITEMS[1], { ...CATALOG_ITEMS[0], quantity: 1 }], { daysOld: 42, status: 'paid', shippingTotal: 300 });
  pushOrder(1, [{ ...CATALOG_ITEMS[3], quantity: 1 }, { ...CATALOG_ITEMS[6], quantity: 3 }], { daysOld: 6, status: 'paid', shippingTotal: 290 });
  invoices.push({
    id: invoiceIdSeq++,
    billId: null,
    customerId: 1,
    orderId: null,
    invoiceNumber: 'INV-CR-1001',
    issueDate: daysAgo(18, now),
    dueDate: daysAgo(4, now),
    amountDue: 8500,
    pdfPath: null,
    status: 'overdue',
    createdAt: daysAgo(18, now),
    updatedAt: daysAgo(4, now)
  });

  // 2: Amina Wangari -> VIP + Settled (KES 48,600 settled, last 3 days ago)
  pushOrder(2, [{ ...CATALOG_ITEMS[2], quantity: 2 }], { daysOld: 48, status: 'paid', shippingTotal: 400 });
  pushOrder(2, [{ ...CATALOG_ITEMS[1], quantity: 1 }, { ...CATALOG_ITEMS[8], quantity: 2 }], { daysOld: 19, status: 'paid', shippingTotal: 300 });
  pushOrder(2, [{ ...CATALOG_ITEMS[4], quantity: 1 }], { daysOld: 3, status: 'paid', shippingTotal: 300 });

  // 3: Brian Mutua -> Lapsing high-spender (> 60 days since last order)
  pushOrder(3, [{ ...CATALOG_ITEMS[1], quantity: 1 }, { ...CATALOG_ITEMS[4], quantity: 1 }], { daysOld: 78, status: 'paid', shippingTotal: 200 });

  // 4: Faith Chebet -> Regular + Settled
  pushOrder(4, [{ ...CATALOG_ITEMS[7], quantity: 2 }], { daysOld: 54, status: 'paid', shippingTotal: 250 });
  pushOrder(4, [{ ...CATALOG_ITEMS[0], quantity: 1 }, { ...CATALOG_ITEMS[9], quantity: 1 }], { daysOld: 11, status: 'paid', shippingTotal: 250 });

  // 5: Samuel Kamau -> Regular + Owes Money
  pushOrder(5, [{ ...CATALOG_ITEMS[5], quantity: 6 }, { ...CATALOG_ITEMS[6], quantity: 2 }], { daysOld: 46, status: 'paid', shippingTotal: 400 });
  pushOrder(5, [{ ...CATALOG_ITEMS[8], quantity: 1 }], { daysOld: 19, status: 'paid', shippingTotal: 250 });
  invoices.push({
    id: invoiceIdSeq++,
    billId: null,
    customerId: 5,
    orderId: null,
    invoiceNumber: 'INV-CR-1002',
    issueDate: daysAgo(9, now),
    dueDate: daysAgo(-5, now),
    amountDue: 3200,
    pdfPath: null,
    status: 'pending',
    createdAt: daysAgo(9, now),
    updatedAt: daysAgo(9, now)
  });

  // 6: Mercy Wanjiku -> New (first purchase <= 30 days)
  pushOrder(6, [{ ...CATALOG_ITEMS[0], quantity: 1 }], { daysOld: 4, status: 'paid', shippingTotal: 250 });

  // 7: Dennis Kiprop -> New + Owes Money (pending order)
  pushOrder(7, [{ ...CATALOG_ITEMS[3], quantity: 1 }], { daysOld: 12, status: 'paid', shippingTotal: 500 });
  pushOrder(7, [{ ...CATALOG_ITEMS[8], quantity: 1 }], { daysOld: 2, status: 'pending', shippingTotal: 300, notes: 'Awaiting M-Pesa STK confirmation' });

  // 8: Zainab Hassan -> No purchases yet (0 orders)
  // 9: Peter Njoroge -> No settled purchases + Pending order (KES 6,500 owed)
  pushOrder(9, [{ ...CATALOG_ITEMS[5], quantity: 5 }], { daysOld: 5, status: 'pending', shippingTotal: 250, notes: 'Lipa Mdogo deposit agreement pending' });

  // 10: Grace Akinyi -> Lapsing regular
  pushOrder(10, [{ ...CATALOG_ITEMS[4], quantity: 1 }], { daysOld: 94, status: 'paid', shippingTotal: 500 });

  // 11: Josephat Mwangi -> VIP + Settled
  pushOrder(11, [{ ...CATALOG_ITEMS[2], quantity: 1 }, { ...CATALOG_ITEMS[5], quantity: 8 }], { daysOld: 22, status: 'paid', shippingTotal: 400 });

  // 12: Esther Wambui -> Regular + Settled
  pushOrder(12, [{ ...CATALOG_ITEMS[3], quantity: 1 }, { ...CATALOG_ITEMS[4], quantity: 1 }], { daysOld: 38, status: 'paid', shippingTotal: 300 });
  pushOrder(12, [{ ...CATALOG_ITEMS[7], quantity: 1 }], { daysOld: 9, status: 'paid', shippingTotal: 300 });

  // Spread remaining customers across Regular / New / Lapsing / No purchases / Archived
  EXTRA_PROFILES.forEach((_, idx) => {
    const customerId = CURATED_CUSTOMERS.length + idx + 1;
    const itemA = CATALOG_ITEMS[idx % CATALOG_ITEMS.length];
    const itemB = CATALOG_ITEMS[(idx + 3) % CATALOG_ITEMS.length];
    const bucket = idx % 5;

    if (bucket === 0) {
      pushOrder(customerId, [{ ...itemA, quantity: 2 }], { daysOld: 45 + idx, status: 'paid', shippingTotal: 250 });
      pushOrder(customerId, [{ ...itemB, quantity: 1 }], { daysOld: 7 + (idx % 12), status: 'paid', shippingTotal: 250 });
    } else if (bucket === 1) {
      pushOrder(customerId, [{ ...itemA, quantity: 1 }], { daysOld: 5 + (idx % 18), status: 'paid', shippingTotal: 250 });
    } else if (bucket === 2) {
      pushOrder(customerId, [{ ...itemA, quantity: 1 }, { ...itemB, quantity: 1 }], { daysOld: 70 + idx, status: 'paid', shippingTotal: 300 });
    } else if (bucket === 3) {
      pushOrder(customerId, [{ ...itemA, quantity: 1 }], { daysOld: 65, status: 'paid', shippingTotal: 200 });
      invoices.push({
        id: invoiceIdSeq++,
        billId: null,
        customerId,
        orderId: null,
        invoiceNumber: `INV-CR-${1010 + idx}`,
        issueDate: daysAgo(15, now),
        dueDate: daysAgo(1, now),
        amountDue: 1850,
        pdfPath: null,
        status: 'overdue',
        createdAt: daysAgo(15, now),
        updatedAt: daysAgo(1, now)
      });
    }
    // bucket === 4 stays 'no_purchases'
  });

  // Ensure unit item quantities default to 1 on orders where raw object came from CATALOG_ITEMS
  orderLines.forEach((line) => {
    if (!line.quantity) {
      line.quantity = 1;
      line.lineTotal = line.unitPrice;
    }
  });

  // Telecom/Service Bills + UsageLogs + Reports for legacy dashboards compatibility
  customers.slice(0, 12).forEach((customer, idx) => {
    const plan = planById.get(customer.planId) || plans[0];
    const isPaidBill = idx > 1;
    const billId = billIdSeq++;
    const createdAt = daysAgo(10 + idx, now);

    bills.push({
      id: billId,
      customerId: customer.id,
      planId: plan.id,
      voiceCallsDuration: 45 + idx * 12,
      dataUsage: 600 + idx * 140,
      smsCount: 15 + idx * 4,
      totalAmount: plan.price,
      paymentStatus: isPaidBill ? 'paid' : 'unpaid',
      invoicePdfUrl: null,
      createdAt,
      updatedAt: createdAt
    });

    const usageTypes = ['call', 'data', 'sms'];
    usageTypes.forEach((usageType, uIdx) => {
      usageLogs.push({
        id: usageIdSeq++,
        customerId: customer.id,
        planId: plan.id,
        usageType,
        duration: usageType === 'data' ? 420 + uIdx * 80 : 12 + idx + uIdx * 5,
        timestamp: daysAgo(2 + uIdx, now),
        billed: isPaidBill
      });
    });

    reports.push({
      id: reportIdSeq++,
      customerId: customer.id,
      reportType: idx % 2 === 0 ? 'Financial Summary' : 'Usage',
      data: {
        currency: 'KES',
        totalBilled: plan.price,
        status: isPaidBill ? 'Settled' : 'Pending'
      },
      generatedAt: createdAt,
      createdAt,
      updatedAt: createdAt
    });
  });

  return {
    plans,
    customers,
    orders,
    orderLines,
    bills,
    payments,
    usageLogs,
    invoices,
    reports
  };
};

module.exports = generateDemoData;
