const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/orders.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Customer routes
router.post(
  '/',
  authenticate,
  [
    body('offerId').notEmpty(),
    body('quantity').optional().isInt({ min: 1 }),
    body('paymentMethod').optional().isIn(['CASH', 'WALLET', 'CARD']),
  ],
  validate,
  controller.createOrder
);

router.get('/my', authenticate, controller.getUserOrders);
router.get('/:id', authenticate, controller.getOrder);
router.post('/:id/cancel', authenticate, controller.cancelOrder);

// Merchant routes
router.get('/merchant/all', authenticate, authorize('MERCHANT', 'ADMIN'), controller.getMerchantOrders);
router.post('/merchant/complete', authenticate, authorize('MERCHANT', 'ADMIN'), [
  body('qrCode').notEmpty(),
], validate, controller.completeOrder);
router.post('/:id/ready', authenticate, authorize('MERCHANT', 'ADMIN'), controller.markReady);

module.exports = router;
