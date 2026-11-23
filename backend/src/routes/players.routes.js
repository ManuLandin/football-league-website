const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const controller = require('../controllers/playersController');

const router = express.Router();

router.get('/categories/:categoryId/players', authMiddleware, controller.listByCategory);
router.post(
  '/categories/:categoryId/players',
  authMiddleware,
  [
    body('nombre').notEmpty(),
    body('apellidos').notEmpty(),
    body('fechaNac').isISO8601(),
    body('numero').isInt({ min: 0 })
  ],
  controller.create
);
router.put(
  '/players/:id',
  authMiddleware,
  [
    body('nombre').notEmpty(),
    body('apellidos').notEmpty(),
    body('fechaNac').isISO8601(),
    body('numero').isInt({ min: 0 })
  ],
  controller.update
);
router.delete('/players/:id', authMiddleware, controller.remove);

module.exports = router;
