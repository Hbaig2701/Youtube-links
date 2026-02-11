const router = require('express').Router();
const { listLinks, createLink, updateLink, deactivateLink, debugClicks, resetClicks } = require('../controllers/link.controller');

router.get('/videos/:id/links', listLinks);
router.post('/videos/:id/links', createLink);
router.put('/links/:id', updateLink);
router.delete('/links/:id', deactivateLink);
router.get('/links/:id/debug', debugClicks);
router.delete('/links/:id/clicks', resetClicks);

module.exports = router;
