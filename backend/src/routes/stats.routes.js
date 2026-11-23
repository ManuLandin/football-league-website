const express = require('express');
const controller = require('../controllers/statsController');

const router = express.Router();

router.get('/dashboard', controller.getDashboardStats);

module.exports = router;
