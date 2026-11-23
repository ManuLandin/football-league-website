const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const controller = require('../controllers/teamsController');

const router = express.Router();

router.get('/', authMiddleware, controller.list);
router.post('/', authMiddleware, [body('nombre').notEmpty()], controller.create);
router.put('/:id', authMiddleware, [body('nombre').notEmpty()], controller.update);
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
