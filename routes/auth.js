// routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const uid2 = require('uid2');
const validator = require('validator');
const { checkBody } = require('../modules/checkBody');

router.post('/register', async (req, res) => {
  try {
    if (!checkBody(req.body, ['email', 'password', 'name'])) {
      return res.status(400).json({ error: 'Champs manquants ou vides' });
    }
    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ error: 'Utilisateur déjà existant' });
    }
    const hash = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ 
      name :req.body.name,
      email: req.body.email,
      password: hash,
      token: uid2(32),
    });
    await newUser.save();
    res.status(201).json({ 
      result: true,
      user: {
        name: newUser.name,
        email: newUser.email,
        token: newUser.token,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



router.post('/login', async (req, res) => {
  try {
    if (!checkBody(req.body, ['email', 'password'])) {
      return res.status(400).json({ error: 'Champs manquants ou vides' });
    }

    if (!validator.isEmail(req.body.email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    res.json({
      result: true,
      user: {
        name: user.name,  
        email: user.email,
        token: user.token,
      }
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


module.exports = router;
