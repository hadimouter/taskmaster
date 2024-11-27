// routes/users.js
const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');


// GET /users
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const user = await User.findOne({ token: token }).select('-password'); // Exclure le mot de passe
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// PUT /users
router.put('/', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const updates = req.body; // Contient les nouvelles données utilisateur
    const user = await User.findOneAndUpdate({ token: token }, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /users/password
router.put('/password', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findOne({ token: token });

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Ancien mot de passe incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /users/notifications
router.post('/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization;
    const { notifications } = req.body;
    const user = await User.findOneAndUpdate({ token: token }, { notifications }, { new: true });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;