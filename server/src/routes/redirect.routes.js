const router = require('express').Router();
const { handleRedirect } = require('../controllers/redirect.controller');

router.get('/go/:videoSlug/:linkLabel', handleRedirect);

module.exports = router;
