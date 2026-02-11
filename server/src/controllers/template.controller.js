const templateModel = require('../models/template.model');
const linkModel = require('../models/link.model');
const slugify = require('../utils/slugify');

function listTemplates(req, res) {
  const templates = templateModel.findAll();
  res.json(templates);
}

function createTemplate(req, res) {
  const { label, destination_url, is_booking_link } = req.body;
  if (!label || !destination_url) {
    return res.status(400).json({ error: 'Label and destination_url are required' });
  }

  try {
    const template = templateModel.create({
      label: slugify(label),
      destinationUrl: destination_url,
      isBookingLink: is_booking_link || false,
    });
    res.status(201).json(template);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'A template with this label already exists' });
    }
    throw err;
  }
}

function updateTemplate(req, res) {
  const existing = templateModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Template not found' });

  const updated = templateModel.update(req.params.id, req.body);
  res.json(updated);
}

function deleteTemplate(req, res) {
  const existing = templateModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Template not found' });

  templateModel.remove(req.params.id);
  res.status(204).end();
}

// Bulk create links from templates for a video
function applyTemplates(req, res) {
  const { template_ids } = req.body;
  const videoId = req.params.id;

  if (!template_ids || !Array.isArray(template_ids) || template_ids.length === 0) {
    return res.status(400).json({ error: 'template_ids array is required' });
  }

  const created = [];
  const skipped = [];

  for (const templateId of template_ids) {
    const template = templateModel.findById(templateId);
    if (!template) continue;

    try {
      const link = linkModel.create({
        videoId,
        label: template.label,
        destinationUrl: template.destination_url,
        isBookingLink: template.is_booking_link === 1,
      });
      created.push(link);
    } catch (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        skipped.push(template.label);
      } else {
        throw err;
      }
    }
  }

  res.status(201).json({ created, skipped });
}

module.exports = { listTemplates, createTemplate, updateTemplate, deleteTemplate, applyTemplates };
