const linkModel = require('../models/link.model');
const videoModel = require('../models/video.model');
const slugify = require('../utils/slugify');

function listLinks(req, res) {
  const video = videoModel.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });

  const links = linkModel.findByVideoId(req.params.id);
  res.json(links);
}

function createLink(req, res) {
  const video = videoModel.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });

  const { label, destination_url, is_booking_link, expires_at } = req.body;
  if (!label || !destination_url) {
    return res.status(400).json({ error: 'Label and destination_url are required' });
  }

  const slugLabel = slugify(label);

  try {
    const link = linkModel.create({
      videoId: req.params.id,
      label: slugLabel,
      destinationUrl: destination_url,
      isBookingLink: is_booking_link || false,
      expiresAt: expires_at || null,
    });
    res.status(201).json(link);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A link with this label already exists for this video' });
    }
    throw err;
  }
}

function updateLink(req, res) {
  const link = linkModel.findById(req.params.id);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  const updated = linkModel.update(req.params.id, req.body);
  res.json(updated);
}

function deactivateLink(req, res) {
  const link = linkModel.findById(req.params.id);
  if (!link) return res.status(404).json({ error: 'Link not found' });

  linkModel.deactivate(req.params.id);
  res.status(204).end();
}

module.exports = { listLinks, createLink, updateLink, deactivateLink };
