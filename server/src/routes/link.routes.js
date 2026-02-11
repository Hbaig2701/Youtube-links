const router = require('express').Router();
const { listLinks, createLink, updateLink, deactivateLink, resetClicks } = require('../controllers/link.controller');

router.get('/videos/:id/links', listLinks);
router.post('/videos/:id/links', createLink);
router.put('/links/:id', updateLink);
router.delete('/links/:id', deactivateLink);
router.delete('/links/:id/clicks', resetClicks);

module.exports = router;
