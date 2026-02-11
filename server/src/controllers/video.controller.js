const videoModel = require('../models/video.model');

function listVideos(req, res) {
  const videos = videoModel.findAll();
  res.json(videos);
}

function getVideo(req, res) {
  const video = videoModel.findById(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json(video);
}

function createVideo(req, res) {
  const { title, slug, youtube_url, youtube_video_id, domain_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const video = videoModel.create({
    slug,
    title,
    youtubeUrl: youtube_url,
    youtubeVideoId: youtube_video_id,
    domainId: domain_id,
  });
  res.status(201).json(video);
}

function updateVideo(req, res) {
  const existing = videoModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Video not found' });

  const video = videoModel.update(req.params.id, req.body);
  res.json(video);
}

function archiveVideo(req, res) {
  const existing = videoModel.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Video not found' });

  videoModel.archive(req.params.id);
  res.status(204).end();
}

module.exports = { listVideos, getVideo, createVideo, updateVideo, archiveVideo };
