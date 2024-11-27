// backend/services/NotificationService.js
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');

class NotificationService {
  constructor() {
    // Vérifier si les variables d'environnement sont définies
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('⚠️ EMAIL_USER ou EMAIL_PASSWORD non définis dans .env');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Vérifier la connexion
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Erreur de configuration email:', error);
      } else {
        console.log('Serveur email prêt ✅');
      }
    });
  }

  async sendEmail(to, subject, htmlContent) {
    try {
      await this.transporter.sendMail({
        from: {
          name: 'TaskMaster',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html: htmlContent // Utilisation de HTML au lieu de text
      });
      console.log('Email envoyé avec succès à:', to);
    } catch (error) {
      console.error('Erreur envoi email:', error);
    }
  }
  async checkUpcomingTasks() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Récupérer les tâches qui arrivent à échéance dans les 24h
      const tasks = await Task.find({
        dueDate: {
          $gte: now,
          $lte: tomorrow
        },
        status: { $ne: 'completed' },
        // Ajouter un champ pour suivre les notifications envoyées
        lastNotificationSent: { $ne: true }
      }).populate('userId');

      for (const task of tasks) {
        const user = await User.findById(task.userId);
        if (!user || !user.notifications) continue;

        if (user.notifications.taskReminders) {
          await this.sendTaskReminder(user.email, task);
          // Marquer la tâche comme notifiée
          await Task.findByIdAndUpdate(task._id, { lastNotificationSent: true });
        }
      }
    } catch (error) {
      console.error('Erreur vérification tâches:', error);
    }
  }

  async sendTaskReminder(email, task) {
    const subject = `Rappel: Tâche à venir - ${task.title}`;

    // Template HTML pour l'email
    const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      .email-container {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 16px;
        overflow: hidden;
      }
      
      .header {
        background: linear-gradient(135deg, #4F46E5, #7C3AED);
        padding: 30px 20px;
        text-align: center;
      }
      
      .header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.5px;
        color: white;
      }
      
      .content {
        padding: 32px 24px;
      }
      
      .content h2 {
        margin: 0 0 24px 0;
        color: #1F2937;
        font-size: 22px;
        font-weight: 600;
      }
      
      .task-info {
        background: #F9FAFB;
        border: 1px solid #E5E7EB;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 24px;
      }
      
      .task-info h3 {
        margin: 0 0 16px 0;
        color: #111827;
        font-size: 18px;
        font-weight: 600;
      }
      
      .task-info p {
        margin: 8px 0;
        color: #4B5563;
        line-height: 1.5;
      }
      
      .date-info {
        display: inline-block;
        background: #EEF2FF;
        padding: 8px 16px;
        border-radius: 8px;
        color: #4F46E5;
        font-size: 14px;
        font-weight: 500;
        margin: 12px 0;
      }
      
      .priority {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      
      .priority-high {
        background: linear-gradient(135deg, #FEE2E2, #FEF2F2);
        color: #DC2626;
      }
      
      .priority-medium {
        background: linear-gradient(135deg, #FEF3C7, #FFFBEB);
        color: #D97706;
      }
      
      .priority-low {
        background: linear-gradient(135deg, #D1FAE5, #ECFDF5);
        color: #059669;
      }
      
      #button {
        display: inline-block;
        padding: 12px 24px;
        background: linear-gradient(135deg, #4F46E5, #7C3AED);
        color: white;
        text-decoration: none;
        border-radius: 10px;
        font-weight: 500;
        margin-top: 24px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);
      }
      
      .footer {
        text-align: center;
        padding: 24px;
        border-top: 1px solid #E5E7EB;
        margin-top: 32px;
      }
      
      .footer p {
        color: #6B7280;
        font-size: 13px;
        line-height: 1.5;
        margin: 0;
      }
    </style>
  </head>
  <body style="background-color: #F3F4F6; padding: 32px 16px;">
    <div class="email-container">
      <div class="header">
        <h1>TaskMaster</h1>
      </div>
      
      <div class="content">
        <h2>📝 Rappel de tâche importante</h2>
        
        <div class="task-info">
          <h3>${task.title}</h3>
          <p>${task.description || 'Aucune description'}</p>
          
          <div class="date-info">
            📅 ${new Date(task.dueDate).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
          </div>
          
          <div style="margin-top: 16px;">
            <span class="priority priority-${task.priority}">
              ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} 
              ${task.priority.toUpperCase()}
            </span>
          </div>
        </div>

        <div style="text-align: center;">
          <a href="http://localhost:3001/tasks/${task._id}" id="button">
            Voir la tâche →
          </a>
        </div>
        
        <div class="footer">
          <p>
            Ceci est un email automatique de TaskMaster.<br>
            Pour modifier vos préférences de notifications, accédez à vos paramètres.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
`;

    await this.sendEmail(email, subject, htmlContent);
  }

  startNotificationService() {
    // Vérifier une fois par heure (à la minute 0)
    cron.schedule('0 * * * *', () => {
      console.log('Vérification horaire des tâches...');
      this.checkUpcomingTasks();
    });
  }
}

module.exports = new NotificationService();