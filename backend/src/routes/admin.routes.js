const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.use(authenticate, authorize('ADMIN'));

router.get('/kpis', controller.getKPIs);

router.get('/users', controller.listUsers);
router.patch('/users/:id', controller.updateUser);

router.get('/merchants', controller.listMerchants);
router.patch('/merchants/:id/status', [
  body('status').isIn(['ACTIVE', 'SUSPENDED', 'PENDING']),
], validate, controller.approveMerchant);
router.patch('/merchants/:id/featured', controller.setFeatured);

router.get('/orders', controller.listOrders);

router.get('/config', controller.getConfig);
router.post('/config', [body('key').notEmpty(), body('value').notEmpty()], validate, controller.updateConfig);

module.exports = router;
