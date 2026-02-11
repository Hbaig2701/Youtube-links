const domainModel = require('../models/domain.model');

async function listDomains(req, res, next) {
  try {
    const domains = await domainModel.findAll();
    res.json(domains);
  } catch (err) { next(err); }
}

async function createDomain(req, res, next) {
  try {
    const { domain, label, is_default } = req.body;
    if (!domain || !label) {
      return res.status(400).json({ error: 'Domain and label are required' });
    }

    // Normalize: strip protocol and trailing slash
    const cleaned = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');

    const d = await domainModel.create({ domain: cleaned, label, isDefault: is_default || false });
    res.status(201).json(d);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This domain is already added' });
    }
    next(err);
  }
}

async function updateDomain(req, res, next) {
  try {
    const existing = await domainModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Domain not found' });

    const updated = await domainModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) { next(err); }
}

async function deleteDomain(req, res, next) {
  try {
    const existing = await domainModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Domain not found' });

    await domainModel.remove(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listDomains, createDomain, updateDomain, deleteDomain };
