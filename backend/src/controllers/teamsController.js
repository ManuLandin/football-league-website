const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

exports.list = async (_req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM equipos ORDER BY nombre');
    return res.json(rows);
  } catch (err) {
    console.error('teams list error', err);
    return res.status(500).json({ message: 'Error al listar equipos' });
  }
};

exports.create = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { nombre } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO equipos (nombre) VALUES (?)', [nombre]);
    return res.status(201).json({ id: result.insertId, nombre });
  } catch (err) {
    console.error('teams create error', err);
    return res.status(500).json({ message: 'Error al crear equipo' });
  }
};

exports.update = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { id } = req.params;
  const { nombre } = req.body;
  try {
    const [result] = await pool.query('UPDATE equipos SET nombre = ? WHERE id = ?', [nombre, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
    return res.json({ id: Number(id), nombre });
  } catch (err) {
    console.error('teams update error', err);
    return res.status(500).json({ message: 'Error al actualizar equipo' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM equipos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
    return res.json({ message: 'Equipo eliminado' });
  } catch (err) {
    console.error('teams delete error', err);
    return res.status(500).json({ message: 'Error al eliminar equipo' });
  }
};
