const router = require('express').Router();

router.use(require('./redirect.routes'));
router.use('/api', require('./video.routes'));
router.use('/api', require('./link.routes'));
router.use('/api', require('./dashboard.routes'));
router.use('/api', require('./analytics.routes'));
router.use('/api', require('./domain.routes'));
router.use('/api', require('./template.routes'));
router.use('/api', require('./webhook.routes'));
router.use('/api', require('./booking.routes'));
router.use('/api', require('./settings.routes'));

module.exports = router;
