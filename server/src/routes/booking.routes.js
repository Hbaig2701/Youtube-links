const router = require('express').Router();
const { getVideoBookings, getRecentBookings } = require('../controllers/booking.controller');

router.get('/videos/:id/bookings', getVideoBookings);
router.get('/bookings/recent', getRecentBookings);

module.exports = router;
