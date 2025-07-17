import {TASK_STATUS, PRIORITY_COLORS, TASK_PRIORITY} from './constants';

// Date formatting helpers
export const formatDate = (date, format = 'MMM DD, YYYY') => {
  if (!date) return '';
  
  const d = new Date(date);
  
  switch (format) {
    case 'MMM DD, YYYY':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });
    case 'MMM DD, YYYY HH:mm':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'HH:mm':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return d.toLocaleDateString();
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMs = targetDate - now;
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`;
  } else if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else {
    return `In ${diffInDays} days`;
  }
};

// Task helpers
export const getTaskStatus = (task) => {
  if (task.completed) {
    return TASK_STATUS.COMPLETED;
  }
  
  const now = new Date();
  const dueDate = new Date(task.dueDate);
  
  if (dueDate < now) {
    return TASK_STATUS.OVERDUE;
  }
  
  return TASK_STATUS.PENDING;
};

export const getPriorityColor = (priority) => {
  return PRIORITY_COLORS[priority] || PRIORITY_COLORS[TASK_PRIORITY.MEDIUM];
};

export const getPriorityLabel = (priority) => {
  switch (priority) {
    case TASK_PRIORITY.LOW:
      return 'Low';
    case TASK_PRIORITY.MEDIUM:
      return 'Medium';
    case TASK_PRIORITY.HIGH:
      return 'High';
    default:
      return 'Medium';
  }
};

export const sortTasksByPriority = (tasks) => {
  const priorityOrder = {
    [TASK_PRIORITY.HIGH]: 3,
    [TASK_PRIORITY.MEDIUM]: 2,
    [TASK_PRIORITY.LOW]: 1,
  };
  
  return tasks.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    const priorityA = priorityOrder[a.priority] || 2;
    const priorityB = priorityOrder[b.priority] || 2;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
};

export const sortTasksByDate = (tasks) => {
  return tasks.sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
};

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateTaskTitle = (title) => {
  return title.trim().length >= 3;
};

export const validateTaskDescription = (description) => {
  return description.trim().length >= 10;
};

// String helpers
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

// Array helpers
export const groupTasksByDate = (tasks) => {
  return tasks.reduce((groups, task) => {
    const date = formatDate(task.dueDate);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {});
};

export const filterTasksByStatus = (tasks, status) => {
  return tasks.filter(task => getTaskStatus(task) === status);
};

export const searchTasks = (tasks, searchTerm) => {
  if (!searchTerm) return tasks;
  
  const term = searchTerm.toLowerCase();
  return tasks.filter(task => 
    task.title.toLowerCase().includes(term) ||
    task.description.toLowerCase().includes(term)
  );
};

// Error handling helpers
export const handleApiError = (error) => {
  if (error.response) {
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    return 'Network error. Please check your connection.';
  } else {
    return 'Something went wrong. Please try again.';
  }
};

// Async helpers
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Device helpers
export const isIOS = () => {
  return Platform.OS === 'ios';
};

export const isAndroid = () => {
  return Platform.OS === 'android';
};

// Theme helpers
export const getStatusBarStyle = (isDark) => {
  return isDark ? 'light-content' : 'dark-content';
};

export const getElevation = (level) => {
  return {
    elevation: level,
    shadowOffset: {
      width: 0,
      height: level / 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: level,
  };
};

export default {
  formatDate,
  formatRelativeTime,
  getTaskStatus,
  getPriorityColor,
  getPriorityLabel,
  sortTasksByPriority,
  sortTasksByDate,
  validateEmail,
  validatePassword,
  validateTaskTitle,
  validateTaskDescription,
  truncateText,
  capitalizeFirst,
  groupTasksByDate,
  filterTasksByStatus,
  searchTasks,
  handleApiError,
  delay,
  debounce,
  isIOS,
  isAndroid,
  getStatusBarStyle,
  getElevation,
};