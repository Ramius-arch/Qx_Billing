/**
 * Private Owner Universal Commerce Gateway Service
 * Connects the owner's private storefront directly to Qx_Billing's double-entry ledger.
 */

const db = require('../models');
const ledgerService = require('./ledgerService');

const Order = db.Order;
const OrderLine = db.OrderLine;
const Customer = db.Customer;
const Invoice = db.Invoice;
const InvoiceLine = db.InvoiceLine;
const Payment = db.Payment;
const sequelize = db.sequelize;

class GatewayService {
  /**
   * Process a private store checkout transaction
   */
  async processOrder({
    storeId = 'private-store',
    customer,
    items,
    shippingAddress = '',
    shippingFee = 0,
    paymentMethod = 'cash',
    paymentReceipt = null,
    notes = ''
  }) {
    if (!customer || (!customer.name && !customer.email && !customer.phone && !customer.phone_number)) {
      const err = new Error('Customer information (name, phone, or email) is required.');
      err.status = 400;
      throw err;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Checkout cart is empty. At least one line item is required.');
      err.status = 400;
      throw err;
    }

    // Load active Business Canvas Profile
    const profile = await ledgerService.getBusinessProfile();
    await ledgerService.ensureAccounts(profile.archetype);

    const currency = profile.currency || 'USD';
    const taxRate = Number(profile.taxRate) || 0;
    const pricesIncludeTax = profile.pricesIncludeTax !== false;
    const settlementAccountCode = profile.settlementAccountCode || '1020';

    // 1. Resolve Customer
    const phone = customer.phone || customer.phone_number || null;
    const email = customer.email || (phone ? `${phone}@private.store` : `customer-${Date.now()}@private.store`);
    const customerName = customer.name || (email ? email.split('@')[0] : 'Private Customer');

    let dbCustomer = null;
    if (phone) {
      dbCustomer = await Customer.findOne({ where: { phone_number: phone } });
    }
    if (!dbCustomer && email) {
      dbCustomer = await Customer.findOne({ where: { email } });
    }

    if (!dbCustomer) {
      dbCustomer = await Customer.create({
        name: customerName,
        phone_number: phone,
        email: email,
        address: shippingAddress || customer.address || 'Direct Private Store Order',
        status: 'active'
      });
    }

    // 2. Financial Calculations
    let itemsSubtotal = 0;
    const normalizedItems = items.map((item, idx) => {
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const price = Math.max(0, Number(item.unitPrice || item.price || 0));
      const lineTotal = Math.round(qty * price * 100) / 100;
      itemsSubtotal += lineTotal;

      return {
        productId: item.productId || item.id || `PROD-${idx + 1}`,
        title: item.title || item.name || `Item ${idx + 1}`,
        unitPrice: price,
        quantity: qty,
        taxRate,
        lineTotal
      };
    });

    itemsSubtotal = Math.round(itemsSubtotal * 100) / 100;
    const shippingTotal = Math.round((Number(shippingFee) || 0) * 100) / 100;

    let netItems = 0;
    let taxTotal = 0;

    if (pricesIncludeTax && taxRate > 0) {
      netItems = Math.round((itemsSubtotal / (1 + taxRate)) * 100) / 100;
      taxTotal = Math.round((itemsSubtotal - netItems) * 100) / 100;
    } else {
      netItems = itemsSubtotal;
      taxTotal = Math.round((itemsSubtotal * taxRate) * 100) / 100;
    }

    const grandTotal = Math.round((netItems + taxTotal + shippingTotal) * 100) / 100;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 3. Archetype Revenue Account Selection
    let revenueAccountCode = '4010'; // default retail
    switch (profile.archetype) {
      case 'saas': revenueAccountCode = '4020'; break;
      case 'services': revenueAccountCode = '4030'; break;
      case 'usage': revenueAccountCode = '4040'; break;
      default: revenueAccountCode = '4010'; break;
    }

    // 4. Build Balanced Double-Entry Journal Lines
    // Debit Settlement Account (Asset) == Credit Revenue + Credit Tax + Credit Shipping
    const journalLines = [
      {
        accountCode: settlementAccountCode,
        debit: grandTotal,
        credit: 0,
        description: `Incoming receipt for Order ${orderNumber} via ${paymentMethod.toUpperCase()}`
      },
      {
        accountCode: revenueAccountCode,
        debit: 0,
        credit: netItems,
        description: `Net earnings from Order ${orderNumber}`
      }
    ];

    if (shippingTotal > 0) {
      journalLines.push({
        accountCode: '4100',
        debit: 0,
        credit: shippingTotal,
        description: `Fulfillment & courier shipping for Order ${orderNumber}`
      });
    }

    if (taxTotal > 0) {
      journalLines.push({
        accountCode: '2200',
        debit: 0,
        credit: taxTotal,
        description: `${profile.taxName || 'VAT'} output tax liability for Order ${orderNumber}`
      });
    }

    // Balance verification & cent-rounding reconciliation
    let totalCredits = journalLines.reduce((sum, l) => sum + (l.credit || 0), 0);
    const balanceVariance = Math.round((grandTotal - totalCredits) * 100) / 100;
    if (balanceVariance !== 0 && Math.abs(balanceVariance) <= 0.02) {
      // Absorb 1-2 cent float variance into revenue line
      journalLines[1].credit = Math.round((journalLines[1].credit + balanceVariance) * 100) / 100;
    }

    // Post to General Ledger
    const journalResult = await ledgerService.postJournalEntry({
      reference: `JE-${orderNumber}`,
      description: `Commercial settlement for Order ${orderNumber}`,
      sourceType: 'order',
      sourceId: orderNumber,
      currency,
      lines: journalLines
    });

    // 5. Atomic Order, Lines, Payment & Invoice Creation
    return await sequelize.transaction(async (t) => {
      const order = await Order.create({
        orderNumber,
        storeId,
        customerId: dbCustomer.id,
        status: 'paid',
        currency,
        subtotal: itemsSubtotal,
        shippingTotal,
        taxTotal,
        total: grandTotal,
        shippingAddress,
        customerName: dbCustomer.name,
        customerPhone: dbCustomer.phone_number,
        customerEmail: dbCustomer.email,
        paymentMethod,
        paymentReceipt: paymentReceipt || `REC-${orderNumber}`,
        journalEntryId: journalResult.journalEntry.id,
        notes
      }, { transaction: t });

      const createdLines = [];
      for (const item of normalizedItems) {
        const line = await OrderLine.create({
          orderId: order.id,
          productId: item.productId,
          title: item.title,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          taxRate: item.taxRate,
          lineTotal: item.lineTotal
        }, { transaction: t });
        createdLines.push(line);
      }

      // Record Payment
      const payment = await Payment.create({
        amount: grandTotal,
        payment_date: new Date(),
        payment_method: paymentMethod,
        receipt_number: paymentReceipt || `REC-${orderNumber}`,
        status: 'completed',
        customerId: dbCustomer.id,
        orderId: order.id
      }, { transaction: t });

      // Generate Invoice
      const invoiceNumber = `INV-${orderNumber}`;
      const invoice = await Invoice.create({
        orderId: order.id,
        customerId: dbCustomer.id,
        invoiceNumber,
        issueDate: new Date(),
        dueDate: new Date(),
        amountDue: grandTotal,
        status: 'paid'
      }, { transaction: t });

      for (const item of normalizedItems) {
        await InvoiceLine.create({
          invoiceId: invoice.id,
          description: item.title,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.lineTotal,
          taxRate: item.taxRate
        }, { transaction: t });
      }

      return {
        success: true,
        orderNumber: order.orderNumber,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          customer: {
            id: dbCustomer.id,
            name: dbCustomer.name,
            email: dbCustomer.email,
            phone: dbCustomer.phone_number
          },
          subtotal: itemsSubtotal,
          shippingTotal,
          taxTotal,
          total: grandTotal,
          currency,
          status: order.status,
          lines: createdLines
        },
        journalEntry: {
          entryNumber: journalResult.journalEntry.entryNumber,
          isBalanced: true,
          totalAmount: grandTotal,
          lines: journalResult.lines
        },
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amountDue: invoice.amountDue,
          status: invoice.status
        },
        payment: {
          id: payment.id,
          receiptNumber: payment.receipt_number,
          status: payment.status
        }
      };
    });
  }

  /**
   * List orders with details
   */
  async getOrders({ limit = 50, offset = 0, status = null }) {
    const where = {};
    if (status) where.status = status;

    return await Order.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        { model: OrderLine, as: 'lines' },
        { model: Customer, attributes: ['id', 'name', 'phone_number', 'email'] },
        { model: Invoice, as: 'invoice', attributes: ['id', 'invoiceNumber', 'status'] }
      ]
    });
  }

  /**
   * Get single order by orderNumber
   */
  async getOrder(orderNumber) {
    const order = await Order.findOne({
      where: { orderNumber },
      include: [
        { model: OrderLine, as: 'lines' },
        { model: Customer },
        { model: Invoice, as: 'invoice', include: [{ model: InvoiceLine, as: 'lines' }] }
      ]
    });

    if (!order) {
      const err = new Error(`Order "${orderNumber}" not found.`);
      err.status = 404;
      throw err;
    }

    return order;
  }
}

module.exports = new GatewayService();
