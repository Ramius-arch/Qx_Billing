const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/Ledger/ledger_controller');

// Business Profile & Canvas Config
router.get('/profile', ledgerController.getProfile);
router.put('/profile', ledgerController.updateProfile);
router.post('/initialize-archetype', ledgerController.initializeArchetype);

// Chart of Accounts
router.get('/accounts', ledgerController.getAccounts);
router.post('/accounts', ledgerController.createAccount);
router.get('/accounts/:code/statement', ledgerController.getAccountStatement);

// General Ledger & Trial Balance
router.get('/trial-balance', ledgerController.getTrialBalance);
router.get('/journal-entries', ledgerController.getJournalEntries);
router.post('/journal-entries', ledgerController.postJournalEntry);
router.post('/reversal', ledgerController.postReversal);

// PoC Demo vs Live Private Ledger Controls
router.post('/reset-poc', ledgerController.resetPoCLedger);
router.post('/seed-poc', ledgerController.seedPoCLedger);

module.exports = router;
