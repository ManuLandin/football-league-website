const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

exports.listByTeam = async (req, res) => {
  const { teamId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, equipo_id AS equipoId FROM categorias WHERE equipo_id = ? ORDER BY nombre',
      [teamId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('categories list error', err);
    return res.status(500).json({ message: 'Error al listar categorías' });
  }
};

exports.create = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { teamId } = req.params;
  const { nombre } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, equipo_id) VALUES (?, ?)',
      [nombre, teamId]
    );
    return res.status(201).json({ id: result.insertId, nombre, equipoId: Number(teamId) });
  } catch (err) {
    console.error('categories create error', err);
    return res.status(500).json({ message: 'Error al crear categoría' });
  }
};

exports.update = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const [result] = await pool.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    return res.json({ id: Number(id), nombre });
  } catch (err) {
    console.error('categories update error', err);
    return res.status(500).json({ message: 'Error al actualizar categoría' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    return res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    console.error('categories delete error', err);
    return res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};
