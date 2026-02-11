const linkModel = require('../models/link.model');
const clickModel = require('../models/click.model');
const videoModel = require('../models/video.model');
const slugify = require('../utils/slugify');

async function listLinks(req, res, next) {
  try {
    const video = await videoModel.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const links = await linkModel.findByVideoId(req.params.id);
    res.json(links);
  } catch (err) { next(err); }
}

async function createLink(req, res, next) {
  try {
    const video = await videoModel.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const { label, destination_url, is_booking_link, expires_at } = req.body;
    if (!label || !destination_url) {
      return res.status(400).json({ error: 'Label and destination_url are required' });
    }

    const slugLabel = slugify(label);

    const link = await linkModel.create({
      videoId: req.params.id,
      label: slugLabel,
      destinationUrl: destination_url,
      isBookingLink: is_booking_link || false,
      expiresAt: expires_at || null,
    });
    res.status(201).json(link);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A link with this label already exists for this video' });
    }
    next(err);
  }
}

async function updateLink(req, res, next) {
  try {
    const link = await linkModel.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    const updated = await linkModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
}

async function deactivateLink(req, res, next) {
  try {
    const link = await linkModel.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    await linkModel.deactivate(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

async function resetClicks(req, res, next) {
  try {
    const link = await linkModel.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    await clickModel.deleteByLinkId(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listLinks, createLink, updateLink, deactivateLink, resetClicks };
