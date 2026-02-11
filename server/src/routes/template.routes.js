const router = require('express').Router();
const { listTemplates, createTemplate, updateTemplate, deleteTemplate, applyTemplates } = require('../controllers/template.controller');

router.get('/templates', listTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);
router.post('/videos/:id/apply-templates', applyTemplates);

module.exports = router;
