/**
 * Universal Double-Entry Accounting & General Ledger Engine
 * Invariant: Sum(Debits) == Sum(Credits) across all posted Journal Entries.
 * Supports multi-archetype chart of accounts (Retail, SaaS, Services, Usage).
 */

const db = require('../models');
const LedgerAccount = db.LedgerAccount;
const JournalEntry = db.JournalEntry;
const JournalLine = db.JournalLine;
const BusinessProfile = db.BusinessProfile;
const sequelize = db.sequelize;

// Universal Core Baseline Chart of Accounts (present in all business models)
const CORE_ACCOUNTS = [
  { code: '1010', name: 'Cash on Hand / Vault', type: 'asset', archetype: 'core', description: 'Physical cash floats and petty cash funds' },
  { code: '1020', name: 'Bank & Payment Gateway Clearing', type: 'asset', archetype: 'core', description: 'Liquid bank balances and unsettled payment gateway clearing (M-Pesa, Stripe, Cards)' },
  { code: '1200', name: 'Accounts Receivable', type: 'asset', archetype: 'core', description: 'Invoiced amounts pending client or customer settlement' },
  { code: '2010', name: 'Accounts Payable', type: 'liability', archetype: 'core', description: 'Unsettled supplier, vendor, and contractor payables' },
  { code: '2200', name: 'Sales Tax / VAT Output Liability', type: 'liability', archetype: 'core', description: 'Output sales tax / VAT collected on taxable sales pending revenue authority remittance' },
  { code: '3010', name: 'Owner / Shareholder Equity', type: 'equity', archetype: 'core', description: 'Paid-in capital and initial business equity' },
  { code: '3020', name: 'Retained Earnings', type: 'equity', archetype: 'core', description: 'Cumulative retained net income / profit' },
  { code: '4900', name: 'Sales Returns & Customer Refunds', type: 'revenue', archetype: 'core', description: 'Contra-revenue account for refunded transactions and customer credits' },
  { code: '6010', name: 'General & Administrative Expenses', type: 'expense', archetype: 'core', description: 'Routine operational overhead, software tools, and administrative utilities' },
  { code: '6020', name: 'Payment Processing & Gateway Fees', type: 'expense', archetype: 'core', description: 'Transaction fees levied by card acquirers, mobile money networks, and banks' }
];

// Archetype-Specific Accounts
const ARCHETYPE_ACCOUNTS = {
  retail: [
    { code: '1300', name: 'Merchandise Inventory', type: 'asset', archetype: 'retail', description: 'Valuation of active on-hand finished goods and retail merchandise' },
    { code: '4010', name: 'Merchandise & Product Sales', type: 'revenue', archetype: 'retail', description: 'Net revenue from physical product sales and orders' },
    { code: '4100', name: 'Shipping & Logistics Revenue', type: 'revenue', archetype: 'retail', description: 'Delivery tariffs and freight charges billed to customers' },
    { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'expense', archetype: 'retail', description: 'Direct acquisition cost of inventory sold' },
    { code: '5020', name: 'Courier & Fulfillment Expense', type: 'expense', archetype: 'retail', description: 'Third-party courier and logistics settlement costs' }
  ],
  saas: [
    { code: '2300', name: 'Deferred / Unearned Subscription Revenue', type: 'liability', archetype: 'saas', description: 'Advance payments collected for annual/quarterly subscription periods not yet delivered' },
    { code: '4020', name: 'Recurring SaaS Subscription Revenue (MRR)', type: 'revenue', archetype: 'saas', description: 'Contracted recurring subscription and license earnings' },
    { code: '4025', name: 'Implementation & Professional Services', type: 'revenue', archetype: 'saas', description: 'One-off setup, onboarding, and enterprise custom development fees' },
    { code: '5030', name: 'Cloud Hosting & Infrastructure Cost', type: 'expense', archetype: 'saas', description: 'Direct infrastructure compute, database, and API hosting costs (AWS, GCP, Vercel)' }
  ],
  services: [
    { code: '1250', name: 'Unbilled Work in Progress (WIP)', type: 'asset', archetype: 'services', description: 'Incurred billable project labor not yet invoiced to clients' },
    { code: '2350', name: 'Client Advance Deposits & Retainers', type: 'liability', archetype: 'services', description: 'Milestone advance deposits and monthly advisory retainers held in trust' },
    { code: '4030', name: 'Turnkey & Milestone Project Revenue', type: 'revenue', archetype: 'services', description: 'Earned contract milestone billings and deliverable fees' },
    { code: '5040', name: 'Subcontractor & Direct Project Expense', type: 'expense', archetype: 'services', description: 'Third-party specialists and direct technical execution labor' }
  ],
  usage: [
    { code: '1210', name: 'Accrued Metered Usage & CDR Accruals', type: 'asset', archetype: 'usage', description: 'Unbilled CDRs, telemetry units, and data consumption consumed during active cycle' },
    { code: '4040', name: 'Metered Consumption & Telemetry Revenue', type: 'revenue', archetype: 'usage', description: 'Consumption revenue rated per megabyte, minute, SMS, or API call' },
    { code: '5050', name: 'Carrier Interconnect & Transit Cost', type: 'expense', archetype: 'usage', description: 'Direct carrier termination, SMS gateway, and bandwidth transit wholesale fees' }
  ]
};

class LedgerService {
  /**
   * Fetches the active BusinessProfile or seeds a sensible default
   */
  async getBusinessProfile() {
    let profile = await BusinessProfile.findOne();
    if (!profile) {
      profile = await BusinessProfile.create({
        businessName: 'Universal Enterprise',
        legalEntity: 'Universal Enterprise Ltd',
        taxId: 'P000000000X',
        currency: 'KES',
        currencySymbol: 'KES',
        taxName: 'VAT',
        taxRate: 0.16,
        pricesIncludeTax: true,
        archetype: 'retail',
        isConfigured: false
      });
    }
    return profile;
  }

  /**
   * Updates BusinessProfile settings
   */
  async updateBusinessProfile(data) {
    const profile = await this.getBusinessProfile();
    const allowed = [
      'businessName', 'legalEntity', 'taxId', 'currency', 'currencySymbol',
      'taxName', 'taxRate', 'pricesIncludeTax', 'archetype', 'address',
      'email', 'phone', 'country', 'settlementAccountCode', 'isConfigured', 'mode', 'settings'
    ];

    const updates = {};
    for (const key of allowed) {
      if (data[key] !== undefined) {
        updates[key] = data[key];
      }
    }

    await profile.update(updates);

    // If archetype was updated, ensure accounts for it exist
    if (updates.archetype) {
      await this.ensureAccounts(updates.archetype);
    }

    return profile;
  }

  /**
   * Ensures standard chart of accounts exists in database for the given archetype
   * @param {string} [archetype='retail']
   */
  async ensureAccounts(archetype = null) {
    if (!archetype) {
      const profile = await this.getBusinessProfile();
      archetype = profile.archetype || 'retail';
    }

    // 1. Seed Core Accounts
    for (const acc of CORE_ACCOUNTS) {
      await LedgerAccount.findOrCreate({
        where: { code: acc.code },
        defaults: acc
      }).catch(() => {});
    }

    // 2. Seed Archetype Specific Accounts
    const archetypeList = ARCHETYPE_ACCOUNTS[archetype] || ARCHETYPE_ACCOUNTS.retail;
    for (const acc of archetypeList) {
      await LedgerAccount.findOrCreate({
        where: { code: acc.code },
        defaults: acc
      }).catch(() => {});
    }
  }

  /**
   * Posts an immutable, balanced Double-Entry Journal Entry
   * Invariant: Total Debits == Total Credits (within 0.01 float tolerance)
   */
  async postJournalEntry({ reference, description, sourceType, sourceId, lines, currency }) {
    await this.ensureAccounts();

    if (!lines || !Array.isArray(lines) || lines.length < 2) {
      const err = new Error('A valid journal entry requires at least two account lines.');
      err.status = 400;
      throw err;
    }

    const profile = await this.getBusinessProfile();
    const entryCurrency = currency || profile.currency || 'KES';

    let totalDebit = 0;
    let totalCredit = 0;

    lines.forEach((line, idx) => {
      const d = Math.round((Number(line.debit) || 0) * 100) / 100;
      const c = Math.round((Number(line.credit) || 0) * 100) / 100;

      if (d < 0 || c < 0) {
        throw new Error(`Line ${idx + 1}: Negative amounts are not allowed in double-entry bookkeeping. Use Debits and Credits.`);
      }
      if (d > 0 && c > 0) {
        throw new Error(`Line ${idx + 1}: A single line cannot have both a debit and a credit amount.`);
      }

      totalDebit += d;
      totalCredit += c;
    });

    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;

    // Strict double-entry invariant check
    const diff = Math.abs(totalDebit - totalCredit);
    if (diff > 0.01) {
      const err = new Error(`Double-entry balance violation: Total Debits (${entryCurrency} ${totalDebit.toFixed(2)}) != Total Credits (${entryCurrency} ${totalCredit.toFixed(2)}). Entry rejected.`);
      err.status = 422;
      throw err;
    }

    // Pre-validate that all account codes exist
    const accountsByCode = {};
    for (const line of lines) {
      if (!accountsByCode[line.accountCode]) {
        const acc = await LedgerAccount.findOne({ where: { code: line.accountCode } });
        if (!acc) {
          const err = new Error(`Ledger account with code "${line.accountCode}" does not exist in Chart of Accounts.`);
          err.status = 404;
          throw err;
        }
        accountsByCode[line.accountCode] = acc;
      }
    }

    const entryNumber = reference || `JE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Execute atomically inside a database transaction
    return await sequelize.transaction(async (t) => {
      const journalEntry = await JournalEntry.create({
        entryNumber,
        entryDate: new Date(),
        description,
        sourceType: sourceType || 'manual',
        sourceId: sourceId ? String(sourceId) : null,
        currency: entryCurrency,
        totalAmount: totalDebit
      }, { transaction: t });

      const createdLines = [];
      for (const line of lines) {
        const acc = accountsByCode[line.accountCode];
        const jLine = await JournalLine.create({
          journalEntryId: journalEntry.id,
          accountId: acc.id,
          debit: Math.round((Number(line.debit) || 0) * 100) / 100,
          credit: Math.round((Number(line.credit) || 0) * 100) / 100,
          description: line.description || description
        }, { transaction: t });

        createdLines.push({
          ...jLine.toJSON(),
          accountCode: acc.code,
          accountName: acc.name,
          accountType: acc.type
        });
      }

      return {
        success: true,
        journalEntry,
        lines: createdLines,
        isBalanced: true,
        totalAmount: totalDebit,
        currency: entryCurrency
      };
    });
  }

  /**
   * Posts an audited, balanced Double-Entry Contra-Reversal Journal Entry
   */
  async postReversalEntry({ originalEntryNumber, reason = 'Transaction reversal / refund', refundAmount = null, sourceId = null }) {
    if (!originalEntryNumber) {
      throw new Error('Original journal entry number is required for reversal.');
    }

    const originalEntry = await JournalEntry.findOne({
      where: { entryNumber: originalEntryNumber },
      include: [{ model: JournalLine, as: 'lines', include: [{ model: LedgerAccount, as: 'account' }] }]
    });

    if (!originalEntry) {
      throw new Error(`Original journal entry "${originalEntryNumber}" not found.`);
    }

    // Check if already reversed
    const existingReversal = await JournalEntry.findOne({
      where: { sourceType: 'reversal', sourceId: originalEntryNumber }
    });
    if (existingReversal) {
      throw new Error(`Journal entry "${originalEntryNumber}" has already been reversed by "${existingReversal.entryNumber}".`);
    }

    // Mirror lines: Debits become Credits, Credits become Debits
    const reversalLines = originalEntry.lines.map(line => {
      return {
        accountCode: line.account ? line.account.code : null,
        debit: line.credit, // swap
        credit: line.debit, // swap
        description: `Reversal of [${originalEntry.entryNumber}]: ${line.description || reason}`
      };
    });

    const reversalRef = `JE-REV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return await this.postJournalEntry({
      reference: reversalRef,
      description: `Contra Reversal for ${originalEntryNumber}: ${reason}`,
      sourceType: 'reversal',
      sourceId: originalEntryNumber,
      lines: reversalLines,
      currency: originalEntry.currency
    });
  }

  /**
   * Returns comprehensive General Ledger Trial Balance
   * Verifies invariant: Total Debits == Total Credits across all ledger accounts.
   */
  async getTrialBalance() {
    await this.ensureAccounts();
    const profile = await this.getBusinessProfile();

    const accounts = await LedgerAccount.findAll({
      include: [{ model: JournalLine, as: 'JournalLines' }],
      order: [['code', 'ASC']]
    });

    let grandTotalDebits = 0;
    let grandTotalCredits = 0;

    const rows = accounts.map(acc => {
      const lines = acc.JournalLines || [];
      const debits = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
      const credits = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);

      grandTotalDebits += debits;
      grandTotalCredits += credits;

      // Normal balance calculation according to account type
      let netBalance = 0;
      if (acc.type === 'asset' || acc.type === 'expense') {
        netBalance = debits - credits; // Positive when Debit > Credit
      } else {
        netBalance = credits - debits; // Positive when Credit > Debit
      }

      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        archetype: acc.archetype,
        totalDebits: Math.round(debits * 100) / 100,
        totalCredits: Math.round(credits * 100) / 100,
        netBalance: Math.round(netBalance * 100) / 100,
        lineCount: lines.length
      };
    });

    grandTotalDebits = Math.round(grandTotalDebits * 100) / 100;
    grandTotalCredits = Math.round(grandTotalCredits * 100) / 100;
    const variance = Math.round(Math.abs(grandTotalDebits - grandTotalCredits) * 100) / 100;

    return {
      asOf: new Date().toISOString(),
      businessName: profile.businessName,
      currency: profile.currency,
      currencySymbol: profile.currencySymbol,
      archetype: profile.archetype,
      isBalanced: variance <= 0.05,
      grandTotalDebits,
      grandTotalCredits,
      variance,
      accounts: rows
    };
  }

  /**
   * Retrieves all journal entries with their lines
   */
  async getJournalEntries({ limit = 50, offset = 0, sourceType = null }) {
    const where = {};
    if (sourceType) where.sourceType = sourceType;

    return await JournalEntry.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: JournalLine,
          as: 'lines',
          include: [{ model: LedgerAccount, as: 'account', attributes: ['code', 'name', 'type'] }]
        }
      ]
    });
  }

  /**
   * Retrieves account statement with running balance
   */
  async getAccountStatement(accountCode) {
    const acc = await LedgerAccount.findOne({
      where: { code: accountCode },
      include: [
        {
          model: JournalLine,
          as: 'JournalLines',
          include: [{ model: JournalEntry, attributes: ['entryNumber', 'entryDate', 'description', 'sourceType'] }]
        }
      ]
    });

    if (!acc) {
      throw new Error(`Account code "${accountCode}" not found.`);
    }

    const lines = acc.JournalLines || [];
    let runningBalance = 0;

    const statementLines = lines.map(line => {
      const d = Number(line.debit) || 0;
      const c = Number(line.credit) || 0;

      if (acc.type === 'asset' || acc.type === 'expense') {
        runningBalance += (d - c);
      } else {
        runningBalance += (c - d);
      }

      return {
        id: line.id,
        date: line.JournalEntry ? line.JournalEntry.entryDate : line.createdAt,
        entryNumber: line.JournalEntry ? line.JournalEntry.entryNumber : null,
        description: line.description,
        debit: d,
        credit: c,
        runningBalance: Math.round(runningBalance * 100) / 100
      };
    });

    return {
      account: {
        code: acc.code,
        name: acc.name,
        type: acc.type,
        archetype: acc.archetype
      },
      currentBalance: Math.round(runningBalance * 100) / 100,
      statement: statementLines
    };
  }

  /**
   * Resets all ledger transactions, orders, and receipts to a pristine zero-balance state.
   * Switches operational mode to 'live_private' for the private store owner.
   */
  async resetToCleanLedger() {
    if (db.JournalLine) await db.JournalLine.destroy({ where: {} });
    if (db.JournalEntry) await db.JournalEntry.destroy({ where: {} });
    if (db.InvoiceLine) await db.InvoiceLine.destroy({ where: {} });
    if (db.Invoice) await db.Invoice.destroy({ where: {} });
    if (db.OrderLine) await db.OrderLine.destroy({ where: {} });
    if (db.Order) await db.Order.destroy({ where: {} });
    if (db.Payment) await db.Payment.destroy({ where: {} });
    if (db.PaymentIntent) await db.PaymentIntent.destroy({ where: {} });
    if (db.StockReservation) await db.StockReservation.destroy({ where: {} });
    if (db.IdempotencyRecord) await db.IdempotencyRecord.destroy({ where: {} });
    if (db.UsageLog) await db.UsageLog.destroy({ where: {} });
    if (db.Bill) await db.Bill.destroy({ where: {} });

    const profile = await this.getBusinessProfile();
    await profile.update({ mode: 'live_private' });
    await this.ensureAccounts(profile.archetype);

    const trialBalance = await this.getTrialBalance();

    return {
      success: true,
      message: 'General Ledger reset to pristine zero-balance state. Ready for private live operations.',
      mode: 'live_private',
      trialBalance
    };
  }

  /**
   * Seeds benchmark Proof of Concept data for demonstration & evaluation.
   * Switches operational mode to 'poc_benchmark'.
   */
  async seedPoCBenchmark() {
    await this.resetToCleanLedger();
    const profile = await this.getBusinessProfile();
    await profile.update({ mode: 'poc_benchmark' });

    const gatewayService = require('./gatewayService');
    const sampleResult = await gatewayService.processOrder({
      storeId: 'poc-storefront',
      customer: {
        name: 'PoC Benchmark Shopper (Amina Wambui)',
        email: 'poc-shopper@benchmark.local',
        phone: '+254712345678'
      },
      items: [
        {
          sku: 'POC-LDH-001',
          title: '[PoC] Archival Denim Piece',
          quantity: 1,
          unitPrice: 3500
        }
      ],
      shippingAddress: 'Kilimani Zone, Nairobi',
      shippingFee: 250,
      paymentMethod: 'mpesa',
      paymentReceipt: 'POC-MPE-9921',
      notes: '[Proof of Concept] Benchmark demonstration order'
    });

    const trialBalance = await this.getTrialBalance();

    return {
      success: true,
      message: 'Benchmark Proof of Concept fixtures loaded successfully.',
      mode: 'poc_benchmark',
      sampleOrder: sampleResult.order?.orderNumber,
      trialBalance
    };
  }
}

module.exports = new LedgerService();
