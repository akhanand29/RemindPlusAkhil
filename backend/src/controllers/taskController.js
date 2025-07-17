const Task = require('../models/Task');
const Notification = require('../models/Notification');
const { scheduleNotification } = require('../utils/pushNotifications');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, category, reminderTime } = req.body;
    const userId = req.user.userId;

    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      category,
      reminderTime,
      userId
    });

    await task.save();

    // Schedule notification if reminderTime is set
    if (reminderTime) {
      await scheduleNotification(task);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task creation'
    });
  }
};

// Get all tasks for a user
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      page = 1, 
      limit = 10, 
      status, 
      priority, 
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const tasks = await Task.find(filter)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalTasks / limit),
          totalTasks,
          hasNext: page < Math.ceil(totalTasks / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

// Get a single task
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const updateData = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Reschedule notification if reminderTime is updated
    if (updateData.reminderTime) {
      await scheduleNotification(task);
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task update'
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await Task.findOneAndDelete({ _id: id, userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete associated notifications
    await Notification.deleteMany({ taskId: id });

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task deletion'
    });
  }
};

// Toggle task completion
exports.toggleComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await Task.findOne({ _id: id, userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date() : null;
    await task.save();

    res.json({
      success: true,
      message: `Task marked as ${task.status}`,
      data: { task }
    });
  } catch (error) {
    console.error('Toggle complete error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task status update'
    });
  }
};

// Mark task as complete
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task marked as completed',
      data: { task }
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task completion'
    });
  }
};

// Mark task as incomplete
exports.incompleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId },
      { 
        status: 'pending',
        completedAt: null
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task marked as incomplete',
      data: { task }
    });
  } catch (error) {
    console.error('Incomplete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task status update'
    });
  }
};

// Get tasks by category
exports.getTasksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const userId = req.user.userId;

    const tasks = await Task.find({ userId, category })
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks by category'
    });
  }
};

// Get tasks by priority
exports.getTasksByPriority = async (req, res) => {
  try {
    const { priority } = req.params;
    const userId = req.user.userId;

    const tasks = await Task.find({ userId, priority })
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks by priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks by priority'
    });
  }
};

// Get tasks by status
exports.getTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user.userId;

    const tasks = await Task.find({ userId, status })
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks by status'
    });
  }
};

// Get tasks due today
exports.getTasksDueToday = async (req, res) => {
  try {
    const userId = req.user.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      userId,
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks due today error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks due today'
    });
  }
};

// Get tasks due this week
exports.getTasksDueThisWeek = async (req, res) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const tasks = await Task.find({
      userId,
      dueDate: {
        $gte: startOfWeek,
        $lt: endOfWeek
      }
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks due this week error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks due this week'
    });
  }
};

// Get tasks by date range
exports.getTasksByDateRange = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const tasks = await Task.find({
      userId,
      dueDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get tasks by date range error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
};

// Get overdue tasks
exports.getOverdueTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentDate = new Date();

    const tasks = await Task.find({
      userId,
      dueDate: { $lt: currentDate },
      status: { $ne: 'completed' }
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching overdue tasks'
    });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = await Task.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalTasks = await Task.countDocuments({ userId });
    const completedTasks = stats.find(s => s._id === 'completed')?.count || 0;
    const pendingTasks = stats.find(s => s._id === 'pending')?.count || 0;
    const overdueTasks = await Task.countDocuments({
      userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    res.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task statistics'
    });
  }
};