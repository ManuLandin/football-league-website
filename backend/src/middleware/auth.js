const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const queryToken = req.query.token;

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : queryToken;

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = authMiddleware;
