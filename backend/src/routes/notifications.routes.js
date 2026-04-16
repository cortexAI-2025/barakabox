const express = require('express');
const router = express.Router();
const controller = require('../controllers/notifications.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', controller.getNotifications);
router.get('/unread-count', controller.getUnreadCount);
router.post('/mark-read', controller.markAllRead);

module.exports = router;
