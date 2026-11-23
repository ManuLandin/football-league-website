const PDFDocument = require('pdfkit');
const { pool } = require('../config/db');

exports.generateRoster = async (req, res) => {
  const { teamId, categoryId } = req.params;
  try {
    const [[teamRows], [categoryRows], [players]] = await Promise.all([
      pool.query('SELECT id, nombre FROM equipos WHERE id = ?', [teamId]),
      pool.query('SELECT id, nombre FROM categorias WHERE id = ? AND equipo_id = ?', [categoryId, teamId]),
      pool.query(
        `SELECT nombre, apellidos, fecha_nac AS fechaNac, numero
         FROM jugadores
         WHERE categoria_id = ?
         ORDER BY numero`,
        [categoryId]
      )
    ]);

    if (!teamRows.length) return res.status(404).json({ message: 'Equipo no encontrado' });
    if (!categoryRows.length) return res.status(404).json({ message: 'Categoría no encontrada para el equipo' });

    const team = teamRows[0];
    const category = categoryRows[0];

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const fileName = `cedula_${team.nombre}_${category.nombre}.pdf`;

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    // Header
    doc
      .fillColor('#0d6efd')
      .fontSize(18)
      .text('Liga Infantil y Juvenil de las Estrellas', { align: 'center' })
      .moveDown(0.5)
      .fillColor('#198754')
      .fontSize(14)
      .text('Cédula de Registro de Jugadores', { align: 'center' })
      .moveDown(1);

    doc
      .fillColor('#000')
      .fontSize(12)
      .text(`Equipo: ${team.nombre}`)
      .text(`Categoría: ${category.nombre}`)
      .moveDown(0.8);

    // Table header
    const startX = 40;
    let y = doc.y;
    const colWidths = [40, 160, 160, 80];
    const headers = ['#', 'Nombre', 'Apellidos', 'F. Nac'];

    doc.rect(startX, y - 4, colWidths.reduce((a, b) => a + b, 0), 24).fillAndStroke('#e8f5e9', '#198754');
    doc.fillColor('#000').fontSize(11);

    let x = startX + 6;
    headers.forEach((h, idx) => {
      doc.text(h, x, y);
      x += colWidths[idx];
    });
    y += 22;

    doc.fontSize(10).fillColor('#000');
    players.forEach((player, index) => {
      doc.rect(startX, y - 2, colWidths.reduce((a, b) => a + b, 0), 22).stroke('#e0e0e0');
      let xPos = startX + 6;
      doc.text(player.numero || index + 1, xPos, y); xPos += colWidths[0];
      doc.text(player.nombre, xPos, y, { width: colWidths[1] - 6 }); xPos += colWidths[1];
      doc.text(player.apellidos, xPos, y, { width: colWidths[2] - 6 }); xPos += colWidths[2];
      const born = player.fechaNac ? new Date(player.fechaNac).toISOString().slice(0, 10) : '';
      doc.text(born, xPos, y);
      y += 22;
    });

    // Signature lines
    y += 20;
    doc.moveTo(startX, y).lineTo(startX + 200, y).stroke('#000');
    doc.text('Firma del entrenador', startX, y + 4);
    doc.moveTo(startX + 240, y).lineTo(startX + 440, y).stroke('#000');
    doc.text('VoBo. Coordinación', startX + 240, y + 4);

    doc.end();
  } catch (err) {
    console.error('pdf error', err);
    return res.status(500).json({ message: 'Error al generar PDF' });
  }
};
