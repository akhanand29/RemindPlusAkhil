const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
// Remove taskValidation for now or make it optional
// const { taskValidation } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

// GET /api/tasks - Get all tasks for user
router.get('/', taskController.getTasks);

// GET /api/tasks/stats - Get task statistics (must be before /:id route)
router.get('/stats', taskController.getTaskStats);

// GET /api/tasks/overdue - Get overdue tasks
router.get('/overdue', taskController.getOverdueTasks);

// GET /api/tasks/due/today - Get tasks due today
router.get('/due/today', taskController.getTasksDueToday);

// GET /api/tasks/due/week - Get tasks due this week
router.get('/due/week', taskController.getTasksDueThisWeek);

// GET /api/tasks/category/:category - Get tasks by category
router.get('/category/:category', taskController.getTasksByCategory);

// GET /api/tasks/priority/:priority - Get tasks by priority
router.get('/priority/:priority', taskController.getTasksByPriority);

// GET /api/tasks/status/:status - Get tasks by status
router.get('/status/:status', taskController.getTasksByStatus);

// GET /api/tasks/date-range - Get tasks by date range
router.get('/date-range', taskController.getTasksByDateRange);

// GET /api/tasks/:id - Get specific task
router.get('/:id', taskController.getTask);

// POST /api/tasks - Create new task
router.post('/', taskController.createTask);

// PUT /api/tasks/:id - Update task
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete task
router.delete('/:id', taskController.deleteTask);

// PUT /api/tasks/:id/complete - Mark task as complete
router.put('/:id/complete', taskController.completeTask);

// PUT /api/tasks/:id/incomplete - Mark task as incomplete
router.put('/:id/incomplete', taskController.incompleteTask);

// PUT /api/tasks/:id/toggle - Toggle task completion
router.put('/:id/toggle', taskController.toggleComplete);

module.exports = router;