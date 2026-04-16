const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/merchants.controller');
const { authenticate, authorize } = require('../middleware/auth');

const upload = multer({ dest: '/tmp/uploads/' });

router.post(
  '/',
  authenticate,
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  controller.createMerchant
);

router.get('/me', authenticate, authorize('MERCHANT', 'ADMIN'), controller.getMerchantProfile);
router.get('/me/analytics', authenticate, authorize('MERCHANT', 'ADMIN'), controller.getMerchantAnalytics);

router.patch(
  '/me',
  authenticate,
  authorize('MERCHANT', 'ADMIN'),
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover', maxCount: 1 }]),
  controller.updateMerchantProfile
);

router.get('/:id', controller.getMerchantPublic);

module.exports = router;
