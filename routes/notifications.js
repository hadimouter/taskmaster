// routes/notifications.js
const express = require('express');
const router = express.Router();
const webpush = require('web-push');

// Configurer les clés VAPID pour les notifications push
webpush.setVapidDetails(
  'mailto:contact@hadimouter.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Stocker les subscriptions
let pushSubscriptions = new Map();

router.post('/subscribe', auth, async (req, res) => {
  const subscription = req.body;
  pushSubscriptions.set(req.user.id, subscription);
  res.status(201).json({});
});

// Envoyer une notification push
const sendPushNotification = async (userId, payload) => {
  const subscription = pushSubscriptions.get(userId);
  if (subscription) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error) {
      console.error('Erreur envoi notification push:', error);
    }
  }
};

module.exports = router;