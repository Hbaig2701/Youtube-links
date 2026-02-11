const videoModel = require('../models/video.model');

async function listVideos(req, res, next) {
  try {
    const videos = await videoModel.findAll();
    res.json(videos);
  } catch (err) { next(err); }
}

async function getVideo(req, res, next) {
  try {
    const video = await videoModel.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json(video);
  } catch (err) { next(err); }
}

async function createVideo(req, res, next) {
  try {
    const { title, slug, youtube_url, youtube_video_id, domain_id } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const video = await videoModel.create({
      slug,
      title,
      youtubeUrl: youtube_url,
      youtubeVideoId: youtube_video_id,
      domainId: domain_id,
    });
    res.status(201).json(video);
  } catch (err) { next(err); }
}

async function updateVideo(req, res, next) {
  try {
    const existing = await videoModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Video not found' });

    const video = await videoModel.update(req.params.id, req.body);
    res.json(video);
  } catch (err) { next(err); }
}

async function archiveVideo(req, res, next) {
  try {
    const existing = await videoModel.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Video not found' });

    await videoModel.archive(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { listVideos, getVideo, createVideo, updateVideo, archiveVideo };
