const router = require('express').Router();
const { listVideos, getVideo, createVideo, updateVideo, archiveVideo } = require('../controllers/video.controller');

router.get('/videos', listVideos);
router.post('/videos', createVideo);
router.get('/videos/:id', getVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', archiveVideo);

module.exports = router;
