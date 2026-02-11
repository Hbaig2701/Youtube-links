const router = require('express').Router();
const { getDevices, getGeo, getVideoClicks } = require('../controllers/analytics.controller');

router.get('/analytics/devices', getDevices);
router.get('/analytics/geo', getGeo);
router.get('/videos/:id/clicks', getVideoClicks);

module.exports = router;
