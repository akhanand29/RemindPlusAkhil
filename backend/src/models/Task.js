const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'finance', 'education', 'shopping', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  reminderTime: {
    type: Date,
    default: null
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    endDate: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedAt: {
    type: Date,
    default: null
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: null
  },
  actualDuration: {
    type: Number, // in minutes
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  remindersSent: [{
    type: Date
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ reminderTime: 1 });

// Virtual for progress percentage
taskSchema.virtual('progress').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Auto-complete task if all subtasks are completed
  if (this.subtasks.length > 0) {
    const allCompleted = this.subtasks.every(subtask => subtask.completed);
    if (allCompleted && this.status !== 'completed') {
      this.status = 'completed';
      this.completedAt = new Date();
    }
  }
  
  // Set completedAt when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Static method to get tasks by user
taskSchema.statics.getTasksByUser = function(userId, filters = {}) {
  const query = { userId, isArchived: false };
  
  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.priority) query.priority = filters.priority;
  if (filters.dateRange) {
    query.dueDate = {
      $gte: filters.dateRange.start,
      $lte: filters.dateRange.end
    };
  }
  
  return this.find(query).sort({ dueDate: 1 });
};

module.exports = mongoose.model('Task', taskSchema);