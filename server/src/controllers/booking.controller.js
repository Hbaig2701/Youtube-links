const bookingModel = require('../models/booking.model');

function getVideoBookings(req, res) {
  const bookings = bookingModel.getByVideoId(req.params.id);
  res.json(bookings);
}

function getRecentBookings(req, res) {
  const bookings = bookingModel.getRecent(20);
  res.json(bookings);
}

module.exports = { getVideoBookings, getRecentBookings };
