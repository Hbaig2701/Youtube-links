const settingModel = require('../models/setting.model');

function getSettings(req, res) {
  const settings = settingModel.getAll();
  res.json(settings);
}

function updateSettings(req, res) {
  const allowedKeys = ['ghl_webhook_secret', 'ghl_api_key', 'notification_email'];
  for (const [key, value] of Object.entries(req.body)) {
    if (allowedKeys.includes(key)) {
      settingModel.set(key, value);
    }
  }
  res.json(settingModel.getAll());
}

module.exports = { getSettings, updateSettings };
