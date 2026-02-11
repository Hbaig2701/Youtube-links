const clickModel = require('../models/click.model');

function getDevices(req, res) {
  const videoId = req.query.videoId || null;
  const data = clickModel.getDeviceBreakdown(videoId);
  res.json(data);
}

function getGeo(req, res) {
  const videoId = req.query.videoId || null;
  const data = clickModel.getGeoBreakdown(videoId);
  res.json(data);
}

function getVideoClicks(req, res) {
  const range = req.query.range || '30d';
  const data = clickModel.getByVideoId(req.params.id, range);
  res.json(data);
}

module.exports = { getDevices, getGeo, getVideoClicks };
