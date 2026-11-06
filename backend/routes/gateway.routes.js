const express = require('express');
const router = express.Router();
const gatewayController = require('../controllers/Gateway/gateway_controller');

router.post('/checkout', gatewayController.checkout);
router.get('/orders', gatewayController.getOrders);
router.get('/orders/:orderNumber', gatewayController.getOrder);

module.exports = router;
