const bookingModel = require('../models/booking.model');

async function getVideoBookings(req, res, next) {
  try {
    const bookings = await bookingModel.getByVideoId(req.params.id);
    res.json(bookings);
  } catch (err) { next(err); }
}

async function getRecentBookings(req, res, next) {
  try {
    const bookings = await bookingModel.getRecent(20);
    res.json(bookings);
  } catch (err) { next(err); }
}

module.exports = { getVideoBookings, getRecentBookings };
