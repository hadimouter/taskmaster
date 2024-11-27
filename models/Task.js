const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date, required: false },
  status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
  category: { type: [String], default: ['travail'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Ajout du nouveau champ
  lastNotificationSent: { type: Boolean, default: false }
});

// Ajoutons aussi une méthode pour réinitialiser lastNotificationSent quand le statut change
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Si le statut a changé, réinitialiser lastNotificationSent
  if (this.isModified('status') && this.status !== 'completed') {
    this.lastNotificationSent = false;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
