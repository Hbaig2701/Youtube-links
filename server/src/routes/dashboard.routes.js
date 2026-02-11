const router = require('express').Router();
const { getSummary, getClicksOverTime } = require('../controllers/dashboard.controller');

router.get('/dashboard/summary', getSummary);
router.get('/dashboard/clicks-over-time', getClicksOverTime);

module.exports = router;
