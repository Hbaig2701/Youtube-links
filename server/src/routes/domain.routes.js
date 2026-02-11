const router = require('express').Router();
const { listDomains, createDomain, updateDomain, deleteDomain } = require('../controllers/domain.controller');

router.get('/domains', listDomains);
router.post('/domains', createDomain);
router.put('/domains/:id', updateDomain);
router.delete('/domains/:id', deleteDomain);

module.exports = router;
