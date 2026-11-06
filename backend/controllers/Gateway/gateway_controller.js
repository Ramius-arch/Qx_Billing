const gatewayService = require('../../services/gatewayService');
const asyncHandler = require('../../middleware/asyncHandler');

/**
 * @desc Process Private Storefront Checkout
 * @route POST /api/v1/gateway/checkout
 */
exports.checkout = asyncHandler(async (req, res) => {
  const result = await gatewayService.processOrder(req.body);
  res.status(201).json(result);
});

/**
 * @desc List Orders
 * @route GET /api/v1/gateway/orders
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;
  const status = req.query.status || null;

  const orders = await gatewayService.getOrders({ limit, offset, status });
  res.status(200).json({ success: true, data: orders });
});

/**
 * @desc Get Single Order Details
 * @route GET /api/v1/gateway/orders/:orderNumber
 */
exports.getOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const order = await gatewayService.getOrder(orderNumber);
  res.status(200).json({ success: true, data: order });
});
