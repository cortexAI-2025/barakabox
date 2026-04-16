const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

const passwordRules = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters');

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name required'),
    body('lastName').trim().notEmpty().withMessage('Last name required'),
    body('email').optional().isEmail().withMessage('Valid email required'),
    body('phone').optional().isMobilePhone().withMessage('Valid phone required'),
    passwordRules,
    body().custom((_, { req }) => {
      if (!req.body.email && !req.body.phone) throw new Error('Email or phone required');
      return true;
    }),
  ],
  validate,
  controller.register
);

router.post(
  '/login',
  [
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone(),
    body('password').notEmpty(),
  ],
  validate,
  controller.login
);

router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

router.get('/me', authenticate, controller.getMe);
router.patch('/me', authenticate, controller.updateMe);
router.post(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
  ],
  validate,
  controller.changePassword
);

module.exports = router;
