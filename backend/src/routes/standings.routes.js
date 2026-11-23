const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const controller = require('../controllers/standingsController');

const router = express.Router();

router.get('/', authMiddleware, controller.list);
router.post(
  '/',
  authMiddleware,
  [
    body('equipoId').isInt({ min: 1 }),
    body('categoriaId').isInt({ min: 1 }),
    body('pj').isInt({ min: 0 }),
    body('g').isInt({ min: 0 }),
    body('e').isInt({ min: 0 }),
    body('p').isInt({ min: 0 }),
    body('gf').isInt({ min: 0 }),
    body('gc').isInt({ min: 0 }),
    body('puntos').isInt({ min: 0 })
  ],
  controller.create
);
router.put(
  '/:id',
  authMiddleware,
  [
    body('pj').isInt({ min: 0 }),
    body('g').isInt({ min: 0 }),
    body('e').isInt({ min: 0 }),
    body('p').isInt({ min: 0 }),
    body('gf').isInt({ min: 0 }),
    body('gc').isInt({ min: 0 }),
    body('puntos').isInt({ min: 0 })
  ],
  controller.update
);
router.delete('/:id', authMiddleware, controller.remove);

module.exports = router;
