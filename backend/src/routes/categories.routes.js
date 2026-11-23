const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const controller = require('../controllers/categoriesController');

const router = express.Router();

router.get('/teams/:teamId/categories', authMiddleware, controller.listByTeam);
router.post('/teams/:teamId/categories', authMiddleware, [body('nombre').notEmpty()], controller.create);
router.put('/categories/:id', authMiddleware, [body('nombre').notEmpty()], controller.update);
router.delete('/categories/:id', authMiddleware, controller.remove);

module.exports = router;
