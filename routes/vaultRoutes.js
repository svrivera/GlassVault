// vaultRoutes.js
const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');

router.post('/get-2fa-code', vaultController.get2FACode);
router.post('/add-2fa-code', vaultController.add2FACode);

module.exports = router;
