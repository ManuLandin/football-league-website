const { pool } = require('../config/db');

exports.getDashboardStats = async (_req, res) => {
  try {
    // Total de equipos
    const [[equiposResult]] = await pool.query('SELECT COUNT(*) as total FROM equipos');
    const totalEquipos = equiposResult.total;

    // Total de categorías
    const [[categoriasResult]] = await pool.query('SELECT COUNT(*) as total FROM categorias');
    const totalCategorias = categoriasResult.total;

    // Total de goles
    const [[golesResult]] = await pool.query(
      'SELECT COALESCE(SUM(goles_local + goles_visita), 0) as total FROM partidos WHERE estado = "jugado" AND goles_local IS NOT NULL AND goles_visita IS NOT NULL'
    );
    const totalGoles = golesResult.total;

    return res.json({
      totalEquipos,
      totalCategorias,
      totalGoles
    });
  } catch (err) {
    console.error('dashboard stats error', err);
    return res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};
