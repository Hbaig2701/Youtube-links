const domainModel = require('../models/domain.model');

function listDomains(req, res) {
  const domains = domainModel.findAll();
  res.json(domains);
}

function createDomain(req, res) {
  const { domain, label, is_default } = req.body;
  if (!domain || !label) {
    return res.status(400).json({ error: 'Domain and label are required' });
  }

  // Normalize: strip protocol and trailing slash
  const cleaned = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');

  try {
    const d = domainModel.create({ domain: cleaned, label, isDefault: is_default || false });
    res.status(201).json(d);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This domain is already added' });
    }
    throw err;
  }
}

function updateDomain(req, res) {
  const existing = domainModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Domain not found' });

  const updated = domainModel.update(req.params.id, req.body);
  res.json(updated);
}

function deleteDomain(req, res) {
  const existing = domainModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Domain not found' });

  domainModel.remove(req.params.id);
  res.status(204).end();
}

module.exports = { listDomains, createDomain, updateDomain, deleteDomain };
