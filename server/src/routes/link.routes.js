const router = require('express').Router();
const { listLinks, createLink, updateLink, deactivateLink } = require('../controllers/link.controller');

router.get('/videos/:id/links', listLinks);
router.post('/videos/:id/links', createLink);
router.put('/links/:id', updateLink);
router.delete('/links/:id', deactivateLink);

module.exports = router;
