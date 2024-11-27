// routes/tasks.js
const router = require('express').Router();
const Task = require('../models/Task');
const User = require('../models/User');  // Assure-toi d'avoir un modèle User pour récupérer l'utilisateur

// Récupérer toutes les tâches
router.get('/', async (req, res) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    // Trouver l'utilisateur correspondant au token
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Rechercher les tâches associées à cet utilisateur
    const tasks = await Task.find({ userId: user._id });
    res.json(tasks);

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des tâches' });
  }
});


// Ajouter une nouvelle tâche
router.post('/', async (req, res) => {
  try {
    const token = req.headers.authorization; // Récupérer le token depuis les headers

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const user = await User.findOne({ token }); // Trouver l'utilisateur en fonction du token

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    const { title, description, priority, dueDate, status, category } = req.body;
    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      status,
      category,
      userId: user._id // Utilise l'ID de l'utilisateur récupéré
    });

    await task.save();
    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la tâche' });
  }
});


// Mettre à jour une tâche existante
router.put('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization; // Récupérer le token depuis les headers

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const user = await User.findOne({ token }); // Trouver l'utilisateur en fonction du token

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: user._id },
      req.body,
      { new: true } // renvoie la tâche mise à jour
    );

    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.json(task);

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la tâche' });
  }
});


// Supprimer une tâche
router.delete('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization; // Récupérer le token depuis les headers

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const user = await User.findOne({ token }); // Trouver l'utilisateur en fonction du token

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: user._id });

    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    res.status(204).send();

  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la tâche' });
  }
});



// Route pour la recherche des tâches
router.get('/search', async (req, res) => {
  const searchTerm = req.query.q; // Le terme de recherche passé dans l'URL

  if (!searchTerm) {
    return res.status(400).json({ message: 'Search term is required' });
  }

  try {
    const token = req.headers.authorization; // Récupérer le token depuis les headers

    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const user = await User.findOne({ token }); // Trouver l'utilisateur en fonction du token

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }
    // Recherche des tâches avec un titre ou une description contenant le terme de recherche et appartenant à l'utilisateur
    const tasks = await Task.find({
      $and: [
        { userId: user._id }, // Ajout de la condition pour que la tâche appartienne à l'utilisateur
        {
          $or: [
            { title: { $regex: searchTerm, $options: 'i' } }, // Recherche insensible à la casse dans le titre
            { description: { $regex: searchTerm, $options: 'i' } }, // Recherche insensible à la casse dans la description
          ]
        }
      ]
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
});


module.exports = router;

