const express = require('express');
const { body, query } = require('express-validator');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/offers.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

const upload = multer({ dest: '/tmp/uploads/' });

router.get('/nearby', optionalAuth, controller.getNearbyOffers);
router.get('/recommended', optionalAuth, controller.getRecommended);

router.get('/merchant/my', authenticate, authorize('MERCHANT', 'ADMIN'), controller.getMerchantOffers);

router.get('/:id', optionalAuth, controller.getOffer);

router.post(
  '/',
  authenticate,
  authorize('MERCHANT', 'ADMIN'),
  upload.single('image'),
  [
    body('title').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('originalPrice').isFloat({ min: 0 }),
    body('minPrice').isFloat({ min: 0 }),
    body('totalQuantity').isInt({ min: 1 }),
    body('pickupStart').isISO8601(),
    body('pickupEnd').isISO8601(),
  ],
  validate,
  controller.createOffer
);

router.patch(
  '/:id',
  authenticate,
  authorize('MERCHANT', 'ADMIN'),
  upload.single('image'),
  controller.updateOffer
);

module.exports = router;
