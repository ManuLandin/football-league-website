const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { testConnection } = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const teamRoutes = require('./routes/teams.routes');
const categoryRoutes = require('./routes/categories.routes');
const playerRoutes = require('./routes/players.routes');
const standingsRoutes = require('./routes/standings.routes');
const pdfRoutes = require('./routes/pdf.routes');
const statsRoutes = require('./routes/stats.routes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api', categoryRoutes);
app.use('/api', playerRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno' });
});

const port = process.env.PORT || 4000;

testConnection()
  .then(() => {
    app.listen(port, () => console.log(`API escuchando en puerto ${port}`));
  })
  .catch((err) => {
    console.error('No se pudo conectar a MySQL', err);
    process.exit(1);
  });
