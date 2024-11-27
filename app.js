// Dans app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Ici, vous avez déjà importé cors, donc pas besoin de le redéclarer
const notificationService = require('./services/NotificationService');

// Démarrer le service de notifications
notificationService.startNotificationService();

var authRoutes = require('./routes/auth');
var taskRoutes = require('./routes/tasks');
var userRoutes = require('./routes/users');

var app = express();

app.use(cors()); // Utilisez simplement la variable cors ici
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes);

const connectionString = process.env.MONGODB_URI;

mongoose.connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected ✅'))
  .catch(error => console.error(error));

module.exports = app;

