const clickModel = require('../models/click.model');
const bookingModel = require('../models/booking.model');

function getSummary(req, res) {
  const clicks = clickModel.getSummary();
  const bookings = bookingModel.getSummary();
  const conversion = bookingModel.getConversionRate();
  const avgTimeToBook = bookingModel.getAvgTimeToBook();
  const topVideos = clickModel.getTopVideos(5);
  const videoConversions = bookingModel.getVideoConversionStats();
  const recentActivity = clickModel.getRecentActivity(10);
  const recentBookings = bookingModel.getRecent(5);

  // Merge conversion stats into top videos
  const conversionMap = {};
  for (const vc of videoConversions) conversionMap[vc.id] = vc;

  const enrichedVideos = topVideos.map(v => ({
    ...v,
    total_bookings: conversionMap[v.id]?.total_bookings || 0,
    conversion_rate: conversionMap[v.id]?.conversion_rate || 0,
  }));

  res.json({
    clicks,
    bookings,
    conversion,
    avgTimeToBook,
    topVideos: enrichedVideos,
    recentActivity,
    recentBookings,
  });
}

function getClicksOverTime(req, res) {
  const range = req.query.range || '7d';
  const data = clickModel.getClicksOverTime(range);
  res.json(data);
}

module.exports = { getSummary, getClicksOverTime };
