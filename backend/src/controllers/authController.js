const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
const { pool } = require('../config/db');

dotenv.config();

const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
const jwtExpires = process.env.JWT_EXPIRES_IN || '8h';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

exports.register = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { nombre, email, password } = req.body;
  try {
    const [existing] = await pool.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, rounds);
    const [result] = await pool.query(
      'INSERT INTO admins (nombre, email, password) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );

    return res.status(201).json({ id: result.insertId, nombre, email });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Error al registrar admin' });
  }
};

exports.login = async (req, res) => {
  const validationError = handleValidation(req, res);
  if (validationError) return validationError;

  const { email, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT id, nombre, email, password FROM admins WHERE email = ?', [email]);
    if (!rows.length) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, nombre: admin.nombre },
      process.env.JWT_SECRET,
      { expiresIn: jwtExpires }
    );

    return res.json({ token, admin: { id: admin.id, nombre: admin.nombre, email: admin.email } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};
