const router = require('express').Router();
const { handleGhlWebhook } = require('../controllers/webhook.controller');

router.post('/webhooks/ghl', handleGhlWebhook);

module.exports = router;
