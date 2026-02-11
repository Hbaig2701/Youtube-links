const settingModel = require('../models/setting.model');

async function getSettings(req, res, next) {
  try {
    const settings = await settingModel.getAll();
    res.json(settings);
  } catch (err) { next(err); }
}

async function updateSettings(req, res, next) {
  try {
    const allowedKeys = ['ghl_webhook_secret', 'ghl_api_key', 'notification_email'];
    for (const [key, value] of Object.entries(req.body)) {
      if (allowedKeys.includes(key)) {
        await settingModel.set(key, value);
      }
    }
    const settings = await settingModel.getAll();
    res.json(settings);
  } catch (err) { next(err); }
}

module.exports = { getSettings, updateSettings };
