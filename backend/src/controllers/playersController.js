const { validationResult } = require('express-validator');
const { pool } = require('../config/db');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

exports.listByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre, apellidos, fecha_nac AS fechaNac, numero, foto, categoria_id AS categoriaId FROM jugadores WHERE categoria_id = ? ORDER BY numero',
      [categoryId]
    );
    return res.json(rows);
  } catch (err) {
    console.error('players list error', err);
    return res.status(500).json({ message: 'Error al listar jugadores' });
  }
};

exports.create = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { categoryId } = req.params;
  const { nombre, apellidos, fechaNac, numero, foto } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO jugadores (nombre, apellidos, fecha_nac, numero, foto, categoria_id) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, apellidos, fechaNac, numero, foto || null, categoryId]
    );
    return res.status(201).json({ id: result.insertId, nombre, apellidos, fechaNac, numero, foto: foto || null, categoriaId: Number(categoryId) });
  } catch (err) {
    console.error('players create error', err);
    return res.status(500).json({ message: 'Error al crear jugador' });
  }
};

exports.update = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { id } = req.params;
  const { nombre, apellidos, fechaNac, numero, foto } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE jugadores SET nombre = ?, apellidos = ?, fecha_nac = ?, numero = ?, foto = ? WHERE id = ?',
      [nombre, apellidos, fechaNac, numero, foto || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Jugador no encontrado' });
    return res.json({ id: Number(id), nombre, apellidos, fechaNac, numero, foto: foto || null });
  } catch (err) {
    console.error('players update error', err);
    return res.status(500).json({ message: 'Error al actualizar jugador' });
  }
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM jugadores WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Jugador no encontrado' });
    return res.json({ message: 'Jugador eliminado' });
  } catch (err) {
    console.error('players delete error', err);
    return res.status(500).json({ message: 'Error al eliminar jugador' });
  }
};
