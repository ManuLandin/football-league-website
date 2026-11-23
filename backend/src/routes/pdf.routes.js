const express = require('express');
const authMiddleware = require('../middleware/auth');
const controller = require('../controllers/pdfController');

const router = express.Router();

router.get('/team/:teamId/category/:categoryId', authMiddleware, controller.generateRoster);

module.exports = router;
