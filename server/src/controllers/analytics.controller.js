const clickModel = require('../models/click.model');

async function getDevices(req, res, next) {
  try {
    const videoId = req.query.videoId || null;
    const data = await clickModel.getDeviceBreakdown(videoId);
    res.json(data);
  } catch (err) { next(err); }
}

async function getGeo(req, res, next) {
  try {
    const videoId = req.query.videoId || null;
    const data = await clickModel.getGeoBreakdown(videoId);
    res.json(data);
  } catch (err) { next(err); }
}

async function getVideoClicks(req, res, next) {
  try {
    const range = req.query.range || '30d';
    const startDate = req.query.start_date || null;
    const endDate = req.query.end_date || null;
    const linkId = req.query.link_id || null;
    const data = await clickModel.getByVideoId(req.params.id, range, { startDate, endDate, linkId });
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = { getDevices, getGeo, getVideoClicks };
