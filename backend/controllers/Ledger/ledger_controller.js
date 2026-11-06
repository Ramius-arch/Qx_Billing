const ledgerService = require('../../services/ledgerService');
const asyncHandler = require('../../middleware/asyncHandler');
const db = require('../../models');

/**
 * @desc Get Business Profile & Accounting Canvas Settings
 * @route GET /api/ledger/profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await ledgerService.getBusinessProfile();
  res.status(200).json({ success: true, data: profile });
});

/**
 * @desc Update Business Profile & Accounting Canvas Settings
 * @route PUT /api/ledger/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await ledgerService.updateBusinessProfile(req.body);
  res.status(200).json({ success: true, data: profile });
});

/**
 * @desc Get all Chart of Accounts
 * @route GET /api/ledger/accounts
 */
exports.getAccounts = asyncHandler(async (req, res) => {
  await ledgerService.ensureAccounts();
  const { type, archetype } = req.query;
  const where = {};
  if (type) where.type = type;
  if (archetype) where.archetype = archetype;

  const accounts = await db.LedgerAccount.findAll({
    where,
    order: [['code', 'ASC']]
  });

  res.status(200).json({ success: true, data: accounts });
});

/**
 * @desc Create Custom Ledger Account
 * @route POST /api/ledger/accounts
 */
exports.createAccount = asyncHandler(async (req, res) => {
  const { code, name, type, description, archetype } = req.body;
  if (!code || !name || !type) {
    return res.status(400).json({ success: false, error: 'Code, name, and type (asset, liability, equity, revenue, expense) are required.' });
  }

  const existing = await db.LedgerAccount.findOne({ where: { code } });
  if (existing) {
    return res.status(409).json({ success: false, error: `Account with code ${code} already exists.` });
  }

  const account = await db.LedgerAccount.create({
    code,
    name,
    type,
    description,
    archetype: archetype || 'custom'
  });

  res.status(201).json({ success: true, data: account });
});

/**
 * @desc Get General Ledger Trial Balance
 * @route GET /api/ledger/trial-balance
 */
exports.getTrialBalance = asyncHandler(async (req, res) => {
  const balance = await ledgerService.getTrialBalance();
  res.status(200).json({ success: true, ...balance });
});

/**
 * @desc Get Journal Entries
 * @route GET /api/ledger/journal-entries
 */
exports.getJournalEntries = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;
  const sourceType = req.query.sourceType || null;

  const entries = await ledgerService.getJournalEntries({ limit, offset, sourceType });
  res.status(200).json({ success: true, data: entries });
});

/**
 * @desc Post a balanced Double-Entry Journal Entry
 * @route POST /api/ledger/journal-entries
 */
exports.postJournalEntry = asyncHandler(async (req, res) => {
  const { reference, description, sourceType, sourceId, lines, currency } = req.body;
  const result = await ledgerService.postJournalEntry({
    reference,
    description,
    sourceType,
    sourceId,
    lines,
    currency
  });

  res.status(201).json(result);
});

/**
 * @desc Post an audited contra-reversal for a journal entry
 * @route POST /api/ledger/reversal
 */
exports.postReversal = asyncHandler(async (req, res) => {
  const { originalEntryNumber, reason, refundAmount, sourceId } = req.body;
  const result = await ledgerService.postReversalEntry({
    originalEntryNumber,
    reason,
    refundAmount,
    sourceId
  });

  res.status(200).json(result);
});

/**
 * @desc Get account ledger statement
 * @route GET /api/ledger/accounts/:code/statement
 */
exports.getAccountStatement = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const statement = await ledgerService.getAccountStatement(code);
  res.status(200).json({ success: true, data: statement });
});

/**
 * @desc Initialize or Switch Industry Archetype COA
 * @route POST /api/ledger/initialize-archetype
 */
exports.initializeArchetype = asyncHandler(async (req, res) => {
  const { archetype } = req.body;
  if (!['retail', 'saas', 'services', 'usage'].includes(archetype)) {
    return res.status(400).json({ success: false, error: 'Valid archetype must be retail, saas, services, or usage.' });
  }

  await ledgerService.updateBusinessProfile({ archetype });
  await ledgerService.ensureAccounts(archetype);

  const trialBalance = await ledgerService.getTrialBalance();
  res.status(200).json({
    success: true,
    message: `Initialized Chart of Accounts for "${archetype}" archetype.`,
    archetype,
    trialBalance
  });
});

/**
 * @desc Reset all demo transactions and set ledger to clean live slate
 * @route POST /api/ledger/reset-poc
 */
exports.resetPoCLedger = asyncHandler(async (req, res) => {
  const result = await ledgerService.resetToCleanLedger();
  res.status(200).json(result);
});

/**
 * @desc Re-seed benchmark Proof of Concept fixtures
 * @route POST /api/ledger/seed-poc
 */
exports.seedPoCLedger = asyncHandler(async (req, res) => {
  const result = await ledgerService.seedPoCBenchmark();
  res.status(200).json(result);
});
