const request = require('supertest');
const app = require('../server');
const db = require('../models');
const ledgerService = require('../services/ledgerService');

describe('Universal Double-Entry Ledger Engine Tests', () => {
  beforeAll(async () => {
    // Sync database in test mode
    await db.sequelize.sync({ force: true });
    await ledgerService.ensureAccounts('retail');
  });

  describe('Chart of Accounts & Archetypes', () => {
    it('should seed core baseline ledger accounts without duplicates', async () => {
      const accounts = await db.LedgerAccount.findAll();
      expect(accounts.length).toBeGreaterThanOrEqual(10);

      const arAccount = accounts.find(a => a.code === '1200');
      expect(arAccount).toBeDefined();
      expect(arAccount.type).toBe('asset');

      const vatAccount = accounts.find(a => a.code === '2200');
      expect(vatAccount).toBeDefined();
      expect(vatAccount.type).toBe('liability');
    });

    it('should seed SaaS archetype accounts on demand', async () => {
      await ledgerService.ensureAccounts('saas');
      const saasAccount = await db.LedgerAccount.findOne({ where: { code: '4020' } });
      expect(saasAccount).toBeDefined();
      expect(saasAccount.name).toContain('MRR');
      expect(saasAccount.type).toBe('revenue');
    });
  });

  describe('Double-Entry Invariant Enforcement', () => {
    it('should post a valid balanced journal entry (Debits == Credits)', async () => {
      const result = await ledgerService.postJournalEntry({
        reference: 'JE-TEST-001',
        description: 'Test Cash Sale with VAT',
        sourceType: 'order',
        sourceId: 'ORD-999',
        lines: [
          { accountCode: '1020', debit: 1160, credit: 0, description: 'Bank clearing inflow' },
          { accountCode: '4010', debit: 0, credit: 1000, description: 'Net sales revenue' },
          { accountCode: '2200', debit: 0, credit: 160, description: 'Output VAT liability' }
        ]
      });

      expect(result.success).toBe(true);
      expect(result.isBalanced).toBe(true);
      expect(result.totalAmount).toBe(1160);
      expect(result.lines.length).toBe(3);

      // Verify in DB
      const entry = await db.JournalEntry.findOne({
        where: { entryNumber: 'JE-TEST-001' },
        include: [{ model: db.JournalLine, as: 'lines' }]
      });
      expect(entry).toBeDefined();
      expect(entry.lines.length).toBe(3);
    });

    it('should REJECT an unbalanced journal entry and rollback transaction', async () => {
      await expect(
        ledgerService.postJournalEntry({
          reference: 'JE-UNBALANCED-001',
          description: 'Corrupted transaction with debit > credit',
          sourceType: 'manual',
          lines: [
            { accountCode: '1020', debit: 1000, credit: 0 },
            { accountCode: '4010', debit: 0, credit: 800 } // Variance of 200!
          ]
        })
      ).rejects.toThrow(/Double-entry balance violation/i);

      // Ensure it was NOT saved
      const entry = await db.JournalEntry.findOne({ where: { entryNumber: 'JE-UNBALANCED-001' } });
      expect(entry).toBeNull();
    });

    it('should reject negative line amounts', async () => {
      await expect(
        ledgerService.postJournalEntry({
          reference: 'JE-NEGATIVE-001',
          description: 'Disallowed negative line',
          sourceType: 'manual',
          lines: [
            { accountCode: '1020', debit: -500, credit: 0 },
            { accountCode: '4010', debit: 0, credit: -500 }
          ]
        })
      ).rejects.toThrow(/Negative amounts are not allowed/i);
    });
  });

  describe('Trial Balance & Audit Report', () => {
    it('should calculate an exact, balanced Trial Balance', async () => {
      const trialBalance = await ledgerService.getTrialBalance();

      expect(trialBalance.isBalanced).toBe(true);
      expect(trialBalance.grandTotalDebits).toBe(trialBalance.grandTotalCredits);
      expect(trialBalance.variance).toBe(0);

      // Bank account should have 1160 debit
      const bank = trialBalance.accounts.find(a => a.code === '1020');
      expect(bank.netBalance).toBe(1160);

      // Sales revenue should have 1000 credit net balance
      const sales = trialBalance.accounts.find(a => a.code === '4010');
      expect(sales.netBalance).toBe(1000);

      // VAT liability should have 160 credit net balance
      const vat = trialBalance.accounts.find(a => a.code === '2200');
      expect(vat.netBalance).toBe(160);
    });
  });

  describe('Audited Contra-Reversal', () => {
    it('should post an exact contra-reversal entry swapping debits and credits', async () => {
      const reversal = await ledgerService.postReversalEntry({
        originalEntryNumber: 'JE-TEST-001',
        reason: 'Customer return and full refund'
      });

      expect(reversal.success).toBe(true);
      expect(reversal.isBalanced).toBe(true);

      // Trial balance should now be back to 0 net balance for these accounts
      const tbAfter = await ledgerService.getTrialBalance();
      expect(tbAfter.isBalanced).toBe(true);
      expect(tbAfter.grandTotalDebits).toBe(tbAfter.grandTotalCredits);

      const bank = tbAfter.accounts.find(a => a.code === '1020');
      expect(bank.netBalance).toBe(0);
    });

    it('should reject reversing an already reversed entry', async () => {
      await expect(
        ledgerService.postReversalEntry({
          originalEntryNumber: 'JE-TEST-001',
          reason: 'Duplicate refund attempt'
        })
      ).rejects.toThrow(/already been reversed/i);
    });
  });

  describe('HTTP Ledger Endpoints', () => {
    it('GET /api/ledger/profile returns business canvas config', async () => {
      const res = await request(app).get('/api/ledger/profile');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businessName).toBeDefined();
    });

    it('PUT /api/ledger/profile updates business canvas settings', async () => {
      const res = await request(app)
        .put('/api/ledger/profile')
        .send({
          businessName: 'Apex Cloud Solutions',
          currency: 'USD',
          currencySymbol: '$',
          archetype: 'saas'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.businessName).toBe('Apex Cloud Solutions');
      expect(res.body.data.currency).toBe('USD');
      expect(res.body.data.archetype).toBe('saas');
    });

    it('GET /api/ledger/trial-balance returns HTTP 200 with balanced audit', async () => {
      const res = await request(app).get('/api/ledger/trial-balance');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.isBalanced).toBe(true);
      expect(res.body.currency).toBe('USD');
    });

    it('POST /api/ledger/reset-poc resets ledger to clean zero-balance state for live private owner', async () => {
      const res = await request(app).post('/api/ledger/reset-poc');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mode).toBe('live_private');
      expect(res.body.trialBalance.isBalanced).toBe(true);
      expect(res.body.trialBalance.grandTotalDebits).toBe(0);
      expect(res.body.trialBalance.grandTotalCredits).toBe(0);
    });

    it('POST /api/ledger/seed-poc loads benchmark proof-of-concept fixtures with balanced ledger', async () => {
      const res = await request(app).post('/api/ledger/seed-poc');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mode).toBe('poc_benchmark');
      expect(res.body.trialBalance.isBalanced).toBe(true);
      expect(res.body.trialBalance.grandTotalDebits).toBeGreaterThan(0);
    });
  });
});
