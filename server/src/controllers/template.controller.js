const templateModel = require('../models/template.model');
const linkModel = require('../models/link.model');
const slugify = require('../utils/slugify');

async function listTemplates(req, res, next) {
  try {
    const templates = await templateModel.findAll();
    res.json(templates);
  } catch (err) { next(err); }
}

async function createTemplate(req, res, next) {
  try {
    const { label, destination_url, is_booking_link } = req.body;
    if (!label || !destination_url) {
      return res.status(400).json({ error: 'Label and destination_url are required' });
    }

    const template = await templateModel.create({
      label: slugify(label),
      destinationUrl: destination_url,
      isBookingLink: is_booking_link || false,
    });
    res.status(201).json(template);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A template with this label already exists' });
    }
    next(err);
  }
}

async function updateTemplate(req, res, next) {
  try {
    const existing = await templateModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Template not found' });

    const updated = await templateModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
}

async function deleteTemplate(req, res, next) {
  try {
    const existing = await templateModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Template not found' });

    await templateModel.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

async function applyTemplates(req, res, next) {
  try {
    const { template_ids } = req.body;
    const videoId = req.params.id;

    if (!template_ids || !Array.isArray(template_ids) || template_ids.length === 0) {
      return res.status(400).json({ error: 'template_ids array is required' });
    }

    const created = [];
    const skipped = [];

    for (const templateId of template_ids) {
      const template = await templateModel.findById(templateId);
      if (!template) continue;

      try {
        const link = await linkModel.create({
          videoId,
          label: template.label,
          destinationUrl: template.destination_url,
          isBookingLink: template.is_booking_link === true,
        });
        created.push(link);
      } catch (err) {
        if (err.code === '23505') {
          skipped.push(template.label);
        } else {
          throw err;
        }
      }
    }

    res.status(201).json({ created, skipped });
  } catch (err) { next(err); }
}

module.exports = { listTemplates, createTemplate, updateTemplate, deleteTemplate, applyTemplates };
