const express = require('express');
const viewsController = require('../controllers/viewsController');

const router = express.Router();

router.get('/', viewsController.getOverview);
router.get('/overview', viewsController.getOverview);
// router.get('/tours', viewsController.getTour);

router.get('/tour/:slug', viewsController.getTour);

module.exports = router;
