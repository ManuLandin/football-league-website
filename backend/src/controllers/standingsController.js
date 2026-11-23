const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

exports.list = async (req, res) => {
  const { categoryId } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT tp.id, tp.equipo_id AS equipoId, tp.categoria_id AS categoriaId, tp.pj, tp.g, tp.e, tp.p, tp.gf, tp.gc, tp.puntos,
              eq.nombre AS equipo
       FROM tabla_posiciones tp
       INNER JOIN equipos eq ON eq.id = tp.equipo_id
       WHERE (? IS NULL OR tp.categoria_id = ?)
       ORDER BY tp.puntos DESC, (tp.gf - tp.gc) DESC, tp.gf DESC`,
      [categoryId || null, categoryId || null]
    );
    return res.json(rows);
  } catch (err) {
    console.error('standings list error', err);
    return res.status(500).json({ message: 'Error al listar tabla' });
  }
};

exports.create = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { equipoId, categoriaId, pj, g, e, p, gf, gc, puntos } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO tabla_posiciones (equipo_id, categoria_id, pj, g, e, p, gf, gc, puntos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [equipoId, categoriaId, pj, g, e, p, gf, gc, puntos]
    );
    return res.status(201).json({ id: result.insertId, equipoId, categoriaId, pj, g, e, p, gf, gc, puntos });
  } catch (err) {
    console.error('standings create error', err);
    return res.status(500).json({ message: 'Error al crear registro de tabla' });
  }
};

exports.update = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { id } = req.params;
  const { pj, g, e, p, gf, gc, puntos } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE tabla_posiciones SET pj = ?, g = ?, e = ?, p = ?, gf = ?, gc = ?, puntos = ? WHERE id = ?`,
      [pj, g, e, p, gf, gc, puntos, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
    return res.json({ id: Number(id), pj, g, e, p, gf, gc, puntos });
  } catch (err) {
    console.error('standings update error', err);
    return res.status(500).json({ message: 'Error al actualizar tabla' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM tabla_posiciones WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
    return res.json({ message: 'Registro eliminado' });
  } catch (err) {
    console.error('standings delete error', err);
    return res.status(500).json({ message: 'Error al eliminar registro' });
  }
};
