// middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Récupère le token sans "Bearer"

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifie le token
    req.user = decoded; // Ajoute les données de l'utilisateur à la requête
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide.' });
  }
};

module.exports = auth;
