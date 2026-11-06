const request = require('supertest');
const app = require('../server');
const db = require('../models');
const ledgerService = require('../services/ledgerService');

describe('Private Owner Headless Gateway & Order Integration Tests', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    await ledgerService.updateBusinessProfile({
      businessName: 'Solaria Private Studio',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 0.10,
      taxName: 'Sales Tax',
      pricesIncludeTax: false,
      archetype: 'retail'
    });
    await ledgerService.ensureAccounts('retail');
  });

  let createdOrderNumber = null;

  it('POST /api/v1/gateway/checkout processes order and posts balanced General Ledger entries', async () => {
    const payload = {
      storeId: 'solaria-studio-private',
      customer: {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+1-555-0199',
        address: '742 Evergreen Terrace, Springfield'
      },
      items: [
        { productId: 'SOL-01', title: 'Handcrafted Ceramic Vase', unitPrice: 120, quantity: 2 },
        { productId: 'SOL-02', title: 'Studio Candle Set', unitPrice: 40, quantity: 1 }
      ],
      shippingFee: 20,
      paymentMethod: 'card',
      paymentReceipt: 'CARD-AUTH-987654'
    };

    const res = await request(app)
      .post('/api/v1/gateway/checkout')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.orderNumber).toBeDefined();
    createdOrderNumber = res.body.orderNumber;

    // Financial check:
    // Items subtotal: 2 * 120 + 40 = 280
    // Tax (10% exclusive): 280 * 0.10 = 28
    // Shipping: 20
    // Grand Total: 280 + 28 + 20 = 328
    expect(res.body.order.subtotal).toBe(280);
    expect(res.body.order.taxTotal).toBe(28);
    expect(res.body.order.shippingTotal).toBe(20);
    expect(res.body.order.total).toBe(328);

    // Journal Entry verification
    expect(res.body.journalEntry.isBalanced).toBe(true);
    expect(res.body.journalEntry.totalAmount).toBe(328);

    // Invoice verification
    expect(res.body.invoice.invoiceNumber).toBe(`INV-${createdOrderNumber}`);
    expect(res.body.invoice.amountDue).toBe(328);

    // Verify Trial Balance remains in strict mathematical equilibrium
    const tb = await ledgerService.getTrialBalance();
    expect(tb.isBalanced).toBe(true);
    expect(tb.grandTotalDebits).toBe(tb.grandTotalCredits);
    expect(tb.variance).toBe(0);

    // Bank clearing should reflect debit of 328
    const bank = tb.accounts.find(a => a.code === '1020');
    expect(bank.netBalance).toBe(328);

    // Product sales revenue should reflect credit of 280
    const sales = tb.accounts.find(a => a.code === '4010');
    expect(sales.netBalance).toBe(280);

    // Shipping revenue should reflect credit of 20
    const shipping = tb.accounts.find(a => a.code === '4100');
    expect(shipping.netBalance).toBe(20);

    // Tax liability should reflect credit of 28
    const tax = tb.accounts.find(a => a.code === '2200');
    expect(tax.netBalance).toBe(28);
  });

  it('GET /api/v1/gateway/orders lists private store orders with relations', async () => {
    const res = await request(app).get('/api/v1/gateway/orders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rows.length).toBeGreaterThanOrEqual(1);

    const first = res.body.data.rows[0];
    expect(first.orderNumber).toBe(createdOrderNumber);
    expect(first.lines.length).toBe(2);
    expect(first.Customer.name).toBe('Elena Rostova');
  });

  it('GET /api/v1/gateway/orders/:orderNumber retrieves single order detail', async () => {
    const res = await request(app).get(`/api/v1/gateway/orders/${createdOrderNumber}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBe(createdOrderNumber);
    expect(res.body.data.invoice.invoiceNumber).toBe(`INV-${createdOrderNumber}`);
  });
});
