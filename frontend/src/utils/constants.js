// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

// Colors
export const COLORS = {
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  placeholder: '#9ca3af',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Fonts
export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semibold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

// Sizes
export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  
  // Font sizes
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  caption: 14,
  small: 12,
  
  // Component sizes
  button: 48,
  input: 48,
  icon: 24,
  iconLarge: 32,
  
  // Screen padding
  padding: 20,
};

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: '#10b981',
  [TASK_PRIORITY.MEDIUM]: '#f59e0b',
  [TASK_PRIORITY.HIGH]: '#ef4444',
};

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
};

// Screen names
export const SCREEN_NAMES = {
  HOME: 'Home',
  TASK_LIST: 'TaskList',
  ADD_TASK: 'AddTask',
  EDIT_TASK: 'EditTask',
  PROFILE: 'Profile',
  LOGIN: 'Login',
  REGISTER: 'Register',
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  SETTINGS: 'user_settings',
  THEME: 'app_theme',
};

// Animation durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_REMINDER: 'task_reminder',
  TASK_OVERDUE: 'task_overdue',
  TASK_COMPLETED: 'task_completed',
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  TIME: 'HH:mm',
};

// Validation patterns
export const VALIDATION = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Session expired. Please login again.',
  VALIDATION: 'Please check your input and try again.',
  GENERIC: 'Something went wrong. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  TASK_COMPLETED: 'Task marked as completed!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

export default {
  API_CONFIG,
  COLORS,
  FONTS,
  SIZES,
  TASK_PRIORITY,
  PRIORITY_COLORS,
  TASK_STATUS,
  SCREEN_NAMES,
  STORAGE_KEYS,
  ANIMATION,
  NOTIFICATION_TYPES,
  DATE_FORMATS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};