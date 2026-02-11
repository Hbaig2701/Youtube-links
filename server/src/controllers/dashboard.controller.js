const clickModel = require('../models/click.model');
const bookingModel = require('../models/booking.model');

async function getSummary(req, res, next) {
  try {
    const [clicks, bookings, conversion, avgTimeToBook, topVideos, videoConversions, recentActivity, recentBookings] = await Promise.all([
      clickModel.getSummary(),
      bookingModel.getSummary(),
      bookingModel.getConversionRate(),
      bookingModel.getAvgTimeToBook(),
      clickModel.getTopVideos(5),
      bookingModel.getVideoConversionStats(),
      clickModel.getRecentActivity(10),
      bookingModel.getRecent(5),
    ]);

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
  } catch (err) { next(err); }
}

async function getClicksOverTime(req, res, next) {
  try {
    const range = req.query.range || '7d';
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;
    const data = await clickModel.getClicksOverTime(range, { startDate, endDate });
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = { getSummary, getClicksOverTime };
