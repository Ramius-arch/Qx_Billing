const request = require('supertest');
const app = require('../server');
const db = require('../models');
const generateDemoData = require('../services/demoData');
const { classifySegment, suggestNextStep } = require('../services/customerInsights');

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (days, now = Date.now()) => new Date(now - days * DAY_MS);

describe('Customer Insights & Retail CRM Endpoints', () => {
  const now = new Date('2026-11-10T12:00:00.000Z');

  describe('Pure Segment Classification & Next-Step Rules', () => {
    it('classifies no purchases, lapsing, vip, new, and regular properly', () => {
      expect(classifySegment({ orderCount: 0, lifetimeSpend: 0 }, now)).toBe('no_purchases');

      // Lapsing beats VIP when silent > 60 days so high-value churn risk surfaces
      expect(classifySegment({
        orderCount: 4,
        lifetimeSpend: 45000,
        firstPurchaseAt: daysAgo(120, now.getTime()),
        lastPurchaseAt: daysAgo(65, now.getTime())
      }, now)).toBe('lapsing');

      expect(classifySegment({
        orderCount: 3,
        lifetimeSpend: 25000,
        firstPurchaseAt: daysAgo(50, now.getTime()),
        lastPurchaseAt: daysAgo(5, now.getTime())
      }, now)).toBe('vip');

      expect(classifySegment({
        orderCount: 1,
        lifetimeSpend: 4500,
        firstPurchaseAt: daysAgo(10, now.getTime()),
        lastPurchaseAt: daysAgo(10, now.getTime())
      }, now)).toBe('new');

      expect(classifySegment({
        orderCount: 2,
        lifetimeSpend: 12000,
        firstPurchaseAt: daysAgo(45, now.getTime()),
        lastPurchaseAt: daysAgo(12, now.getTime())
      }, now)).toBe('regular');
    });

    it('prioritizes owed balances over segment advice in suggestNextStep', () => {
      const msg = suggestNextStep({ segment: 'vip', balanceDue: 8500, daysSinceLastPurchase: 4 }, 'Kevin');
      expect(msg).toMatch(/owes KES 8,500/i);
      expect(msg).toMatch(/WhatsApp reminder/i);

      const lapsingMsg = suggestNextStep({ segment: 'lapsing', balanceDue: 0, daysSinceLastPurchase: 72 }, 'Brian');
      expect(lapsingMsg).toMatch(/72 days/);
    });
  });

  describe('Demo Data Sanity (Kenyan SME Retail)', () => {
    it('generates Kenyan customers, orders, and lines with valid KES totals and 254 numbers', () => {
      const demo = generateDemoData();
      expect(demo.customers.length).toBeGreaterThanOrEqual(20);
      expect(demo.orders.length).toBeGreaterThanOrEqual(10);
      expect(demo.orderLines.length).toBeGreaterThanOrEqual(10);

      for (const customer of demo.customers) {
        expect(customer.phone_number).toMatch(/^254[17]\d{8}$/);
      }
      for (const order of demo.orders) {
        expect(order.currency).toBe('KES');
        expect(Number.isFinite(order.total)).toBe(true);
        expect(order.total).toBe(order.subtotal + order.shippingTotal);
      }
    });
  });

  describe('Customer API Integration (/api/customers)', () => {
    let vipId;
    let lapsingId;
    let newId;
    let pendingId;
    let emptyId;

    beforeAll(async () => {
      await db.sequelize.sync({ force: true });

      const vip = await db.Customer.create({
        name: 'Wanjiru Njoroge',
        phone_number: '254711223344',
        email: 'wanjiru@example.co.ke',
        address: 'Kilimani, Nairobi',
        status: 'active'
      });
      vipId = vip.id;

      const lapsing = await db.Customer.create({
        name: 'Omondi Otieno',
        phone_number: '254722334455',
        address: 'Kisumu CBD',
        status: 'active'
      });
      lapsingId = lapsing.id;

      const fresh = await db.Customer.create({
        name: 'Aisha Mohamed',
        phone_number: '254733445566',
        status: 'active'
      });
      newId = fresh.id;

      const debtor = await db.Customer.create({
        name: 'Kipchoge Keino',
        phone_number: '254799887766',
        status: 'active'
      });
      pendingId = debtor.id;

      const empty = await db.Customer.create({
        name: 'Mary Wambui',
        phone_number: '254700112233',
        status: 'active'
      });
      emptyId = empty.id;

      const nowMs = Date.now();
      const vipOrder = await db.Order.create({
        orderNumber: 'ORD-VIP-1',
        customerId: vipId,
        status: 'paid',
        currency: 'KES',
        subtotal: 24500,
        shippingTotal: 500,
        taxTotal: 3448.28,
        total: 25000,
        shippingAddress: 'Kilimani, Nairobi',
        customerName: vip.name,
        customerPhone: vip.phone_number,
        customerEmail: vip.email,
        paymentMethod: 'mpesa',
        paymentReceipt: 'MPESA001',
        createdAt: daysAgo(5, nowMs),
        updatedAt: daysAgo(5, nowMs)
      });

      await db.OrderLine.create({
        orderId: vipOrder.id,
        productId: 'SKU-1',
        title: 'Inverter Battery 100Ah',
        unitPrice: 24500,
        quantity: 1,
        taxRate: 0.16,
        lineTotal: 24500
      });

      await db.Payment.create({
        amount: 25000,
        payment_date: daysAgo(5, nowMs),
        payment_method: 'mpesa',
        receipt_number: 'MPESA001',
        status: 'completed',
        customerId: vipId,
        orderId: vipOrder.id
      });

      await db.Order.create({
        orderNumber: 'ORD-LAP-1',
        customerId: lapsingId,
        status: 'fulfilled',
        currency: 'KES',
        subtotal: 21000,
        shippingTotal: 0,
        taxTotal: 2896.55,
        total: 21000,
        shippingAddress: 'Kisumu CBD',
        customerName: lapsing.name,
        customerPhone: lapsing.phone_number,
        paymentMethod: 'cash',
        createdAt: daysAgo(85, nowMs),
        updatedAt: daysAgo(85, nowMs)
      });

      await db.Order.create({
        orderNumber: 'ORD-NEW-1',
        customerId: newId,
        status: 'paid',
        currency: 'KES',
        subtotal: 4500,
        shippingTotal: 200,
        taxTotal: 648.28,
        total: 4700,
        shippingAddress: 'Nairobi',
        customerName: fresh.name,
        customerPhone: fresh.phone_number,
        paymentMethod: 'mpesa',
        paymentReceipt: 'MPESA002',
        createdAt: daysAgo(3, nowMs),
        updatedAt: daysAgo(3, nowMs)
      });

      await db.Invoice.create({
        customerId: pendingId,
        invoiceNumber: 'INV-OPEN-1',
        amountDue: 6400,
        status: 'overdue',
        issueDate: daysAgo(15, nowMs),
        dueDate: daysAgo(1, nowMs)
      });
    });

    it('POST /api/customers allows optional address/planId, normalizes Kenyan phone, and blocks duplicates with 409', async () => {
      const created = await request(app)
        .post('/api/customers')
        .send({ name: '  Kamau Njuguna ', phone_number: '0718 555 666' });

      expect(created.status).toBe(201);
      expect(created.body.success).toBe(true);
      expect(created.body.data.phone_number).toBe('254718555666');
      expect(created.body.data.name).toBe('Kamau Njuguna');

      const dup = await request(app)
        .post('/api/customers')
        .send({ name: 'Kamau Clone', phone_number: '+254 718 555 666' });

      expect(dup.status).toBe(409);
      expect(dup.body.success).toBe(false);

      const badPhone = await request(app)
        .post('/api/customers')
        .send({ name: 'Invalid Phone', phone_number: 'not-a-phone' });
      expect(badPhone.status).toBe(400);
    });

    it('GET /api/customers returns insights, segmentCounts, segment filters, normalized phone search, and spend sorting', async () => {
      const res = await request(app)
        .get('/api/customers?sortBy=lifetimeSpend&sortOrder=desc');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.segmentCounts.vip).toBe(1);
      expect(res.body.segmentCounts.lapsing).toBe(1);
      expect(res.body.segmentCounts.new).toBe(1);
      expect(res.body.segmentCounts.owes_money).toBe(1);
      expect(res.body.customers[0].id).toBe(vipId);
      expect(res.body.customers[0].insights.lifetimeSpend).toBe(25000);

      const vipOnly = await request(app).get('/api/customers?segment=vip');
      expect(vipOnly.status).toBe(200);
      expect(vipOnly.body.customers.map(c => c.id)).toEqual([vipId]);

      const owesOnly = await request(app).get('/api/customers?segment=owes_money');
      expect(owesOnly.status).toBe(200);
      expect(owesOnly.body.customers.map(c => c.id)).toEqual([pendingId]);

      const searchLocalPhone = await request(app).get('/api/customers?search=0711223344');
      expect(searchLocalPhone.status).toBe(200);
      expect(searchLocalPhone.body.customers.length).toBe(1);
      expect(searchLocalPhone.body.customers[0].id).toBe(vipId);
    });

    it('GET /api/customers/:id/summary returns Customer 360 orders, lines, payments, openInvoices, and nextStep', async () => {
      const res = await request(app).get(`/api/customers/${vipId}/summary`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer.name).toBe('Wanjiru Njoroge');
      expect(res.body.data.insights.segment).toBe('vip');
      expect(res.body.data.insights.nextStep).toMatch(/best customers/i);
      expect(res.body.data.orders.length).toBe(1);
      expect(res.body.data.orders[0].lines[0].title).toBe('Inverter Battery 100Ah');
      expect(res.body.data.payments.length).toBe(1);

      const debtorRes = await request(app).get(`/api/customers/${pendingId}/summary`);
      expect(debtorRes.status).toBe(200);
      expect(debtorRes.body.data.openInvoices.length).toBe(1);
      expect(debtorRes.body.data.insights.balanceDue).toBe(6400);

      const missing = await request(app).get('/api/customers/999999/summary');
      expect(missing.status).toBe(404);
    });

    it('DELETE /api/customers/:id archives instead of destroying order history', async () => {
      const del = await request(app).delete(`/api/customers/${vipId}`);
      expect(del.status).toBe(200);
      expect(del.body.data.status).toBe('archived');

      // Hidden from default active list
      const activeList = await request(app).get('/api/customers');
      expect(activeList.body.customers.find(c => c.id === vipId)).toBeUndefined();

      // Still accessible when includeArchived=true and order history intact
      const archivedList = await request(app).get('/api/customers?includeArchived=true');
      const archivedCustomer = archivedList.body.customers.find(c => c.id === vipId);
      expect(archivedCustomer).toBeDefined();
      expect(archivedCustomer.status).toBe('archived');

      const summary = await request(app).get(`/api/customers/${vipId}/summary`);
      expect(summary.status).toBe(200);
      expect(summary.body.data.orders.length).toBe(1);
    });
  });
});
