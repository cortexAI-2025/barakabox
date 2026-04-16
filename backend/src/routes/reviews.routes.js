const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/reviews.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  authenticate,
  [
    body('orderId').notEmpty(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').optional().isLength({ max: 500 }),
  ],
  validate,
  controller.createReview
);

router.get('/merchant/:merchantId', controller.getMerchantReviews);

module.exports = router;
