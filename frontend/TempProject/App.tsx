import React, { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { TriggerType } from '@notifee/react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Switch,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Type definitions
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  completed: boolean;
  category: string;
  reminder: boolean;
  reminderTime?: '10min' | '15min' | '30min' | '1hour' | '24hour';
}

interface DashboardHeaderProps {
  totalTasks: number;
  completedTasks: number;
}

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

interface TaskFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  editingTask: Task | null;
}

interface QuickStatsProps {
  tasks: Task[];
  onStatPress: (filter: 'pending' | 'overdue' | 'today') => void;
}

interface FloatingAddButtonProps {
  onPress: () => void;
}

interface TasksViewProps {
  tasks: Task[];
  filter: 'all' | 'pending' | 'overdue' | 'today';
  onBack: () => void;
  onToggle: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

// ADD THESE NEW TYPES HERE - Push Notification Types
interface PushNotificationToken {
  os: string;
  token: string;
}

interface PushNotificationObject {
  foreground: boolean;
  userInteraction: boolean;
  message: string | object;
  data: object;
  badge: number;
  alert: object;
  sound: string;
  finish: (fetchResult: string) => void;
  id?: string;
  title?: string;
  userInfo?: any;
  action?: string;
}

interface PushNotificationError {
  message: string;
  code?: number;
}

// Theme colors (rest of your code continues unchanged...)
const colors = {
  primary: '#6C63FF',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
  success: '#96CEB4',
  warning: '#FFEAA7',
  error: '#FF6B6B',
  dark: '#2D3436',
  light: '#F8F9FA',
  gray: '#6C757D',
  white: '#FFFFFF',
  background: '#F5F7FA',
  card: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

// Priority colors
const priorityColors: Record<'high' | 'medium' | 'low', string> = {
  high: '#FF6B6B',
  medium: '#FFB347',
  low: '#87CEEB',
};

// Sample tasks data
const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project presentation',
    description: 'Prepare slides for the quarterly review meeting',
    priority: 'high',
    dueDate: '2025-07-15',
    completed: false,
    category: 'Work',
    reminder: true,
    reminderTime: '1hour', // Add this line
  },
  {
    id: '2',
    title: 'Grocery shopping',
    description: 'Buy fruits, vegetables, and dairy products',
    priority: 'medium',
    dueDate: '2025-07-16',
    completed: false,
    category: 'Personal',
    reminder: true,
  },
  {
    id: '3',
    title: 'Call dentist',
    description: 'Schedule appointment for dental checkup',
    priority: 'low',
    dueDate: '2025-07-18',
    completed: true,
    category: 'Health',
    reminder: false,
  },
  {
    id: '4',
    title: 'Review monthly budget',
    description: 'Check expenses and update financial planning',
    priority: 'medium',
    dueDate: '2025-07-20',
    completed: false,
    category: 'Personal',
    reminder: true,
  },
  {
    id: '5',
    title: 'Overdue task example',
    description: 'This task is overdue to demonstrate the feature',
    priority: 'high',
    dueDate: '2025-07-10',
    completed: false,
    category: 'Work',
    reminder: true,
  },
];

// Dashboard Header Component
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ totalTasks, completedTasks }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.dashboardHeader, { opacity: fadeAnim }]}>
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.greetingText}>RemindPlus - by Akhilesh Anand</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
        <View style={styles.taskSummary}>
          <Text style={styles.taskSummaryText}>
            {completedTasks} of {totalTasks} tasks completed
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }
              ]} 
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Quick Stats Component
const QuickStats: React.FC<QuickStatsProps> = ({ tasks, onStatPress }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];
  
  const pending = tasks.filter(t => !t.completed).length;
  const overdue = tasks.filter(t => {
    if (t.completed) return false;
    const [year, month, day] = t.dueDate.split('-');
    const taskDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return taskDate < today;
  }).length;
  const todayTasks = tasks.filter(t => t.dueDate === todayString).length;

  return (
    <View style={styles.quickStats}>
      <TouchableOpacity 
        style={styles.statCard}
        onPress={() => onStatPress('pending')}
        activeOpacity={0.7}
      >
        <View style={[styles.statIcon, { backgroundColor: colors.warning }]}>
          <Text style={styles.statIconText}>⏳</Text>
        </View>
        <Text style={styles.statNumber}>{pending}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.statCard}
        onPress={() => onStatPress('overdue')}
        activeOpacity={0.7}
      >
        <View style={[styles.statIcon, { backgroundColor: colors.error }]}>
          <Text style={styles.statIconText}>🔥</Text>
        </View>
        <Text style={styles.statNumber}>{overdue}</Text>
        <Text style={styles.statLabel}>Overdue</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.statCard}
        onPress={() => onStatPress('today')}
        activeOpacity={0.7}
      >
        <View style={[styles.statIcon, { backgroundColor: colors.primary }]}>
          <Text style={styles.statIconText}>📅</Text>
        </View>
        <Text style={styles.statNumber}>{todayTasks}</Text>
        <Text style={styles.statLabel}>Today</Text>
      </TouchableOpacity>
    </View>
  );
};

// Task Card Component
const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const isOverdue = !task.completed && (() => {
  const [year, month, day] = task.dueDate.split('-');
  const taskDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return taskDate < today;
})();

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);
const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare dates only
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  return `${diffDays} days left`;
};

const formatFullDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
};

  return (
    <Animated.View style={[
      styles.taskCard,
      { transform: [{ scale: scaleAnim }] },
      isOverdue && styles.overdueCard
    ]}>
      <View style={styles.taskCardHeader}>
        <TouchableOpacity 
          style={styles.taskCheckbox}
          onPress={() => onToggle(task.id)}
        >
          <View style={[
            styles.checkbox,
            task.completed && styles.checkboxCompleted,
            { borderColor: priorityColors[task.priority] }
          ]}>
            {task.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
        
        <View style={styles.taskCardContent}>
          <Text style={[styles.taskCardTitle, task.completed && styles.completedText]}>
            {task.title}
          </Text>
          <Text style={styles.taskCardDescription}>{task.description}</Text>
          
          <View style={styles.taskCardMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColors[task.priority] }]}>
              <Text style={styles.priorityText}>{task.priority.toUpperCase()}</Text>
            </View>
            <Text style={styles.categoryBadge}>{task.category}</Text>
          </View>
          
          <View style={styles.taskCardFooter}>
            <View style={styles.dateContainer}>
              <Text style={[
                styles.dueDateText,
                isOverdue && styles.overdueText
              ]}>
                {formatDate(task.dueDate)}
              </Text>
              <Text style={[
                styles.fullDateText,
                isOverdue && styles.overdueText
              ]}>
                {formatFullDate(task.dueDate)}
              </Text>
            </View>
            <View style={styles.taskActions}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => onEdit(task)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => onDelete(task.id)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Additional styles for the improved date display

// Tasks View Component
const TasksView: React.FC<TasksViewProps> = ({ 
  tasks, 
  filter, 
  onBack, 
  onToggle, 
  onEdit, 
  onDelete 
}) => {
  const getFilteredTasks = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];
  
  switch (filter) {
    case 'pending':
      return tasks.filter(t => !t.completed);
    case 'overdue':
      return tasks.filter(t => {
        if (t.completed) return false;
        const [year, month, day] = t.dueDate.split('-');
        const taskDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return taskDate < today;
      });
    case 'today':
      return tasks.filter(t => t.dueDate === todayString);
    default:
      return tasks;
  }
};

  const getFilterTitle = () => {
    switch (filter) {
      case 'pending':
        return 'Pending Tasks';
      case 'overdue':
        return 'Overdue Tasks';
      case 'today':
        return "Today's Tasks";
      default:
        return 'All Tasks';
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.tasksViewContainer}>
      <View style={styles.tasksViewHeader}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.tasksViewTitle}>{getFilterTitle()}</Text>
        <Text style={styles.tasksCount}>({filteredTasks.length})</Text>
      </View>
      
      <ScrollView style={styles.tasksViewContent} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === 'pending' && 'Great! You have no pending tasks.'}
              {filter === 'overdue' && 'No overdue tasks. Keep it up!'}
              {filter === 'today' && 'No tasks scheduled for today.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            )}
            scrollEnabled={false}
            contentContainerStyle={styles.tasksList}
          />
        )}
      </ScrollView>
    </View>
  );
};

// Floating Add Button Component
const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <TouchableOpacity
      style={styles.floatingAddButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.addButtonContent,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Text style={styles.addButtonText}>+</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Task Form Modal Component
const TaskFormModal: React.FC<TaskFormModalProps> = ({ visible, onClose, onSave, editingTask }) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [category, setCategory] = useState<string>('Personal');
  const [reminder, setReminder] = useState<boolean>(true);
  const [reminderTime, setReminderTime] = useState<'10min' | '15min' | '30min' | '1hour' | '24hour'>('30min');
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper function to format date for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Animate modal appearance
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);
  
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
      setCategory(editingTask.category);
      setReminder(editingTask.reminder);
      setReminderTime(editingTask.reminderTime || '30min');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate(getTodayDate());
      setCategory('Personal');
      setReminder(true);
      setReminderTime('30min');
    }
  }, [editingTask, visible]);

  const handleSave = (): void => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dueDate)) {
      Alert.alert('Error', 'Please enter a valid date in YYYY-MM-DD format');
      return;
    }

    const task: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate,
      category,
      reminder,
      reminderTime: reminder ? reminderTime : undefined,
      completed: editingTask ? editingTask.completed : false,
    };

    onSave(task);
    onClose();
  };


  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View style={[
          styles.enhancedModalContent,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          {/* Enhanced Header */}
          <View style={styles.enhancedModalHeader}>
            <View style={styles.headerIconContainer}>
              <Text style={styles.headerIcon}>✨</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.enhancedModalTitle}>
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </Text>
              <Text style={styles.enhancedModalSubtitle}>
                {editingTask ? 'Update your task details' : 'Let\'s get things done!'}
              </Text>
            </View>
            <TouchableOpacity style={styles.enhancedCloseButton} onPress={onClose}>
              <Text style={styles.enhancedCloseButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.enhancedModalBody} showsVerticalScrollIndicator={false}>
            {/* Task Title Input */}
            <View style={styles.enhancedInputContainer}>
              <Text style={styles.enhancedInputLabel}>Task Title</Text>
              <TextInput
                style={styles.enhancedInput}
                placeholder="What needs to be done?"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={colors.gray}
                autoFocus
              />
              <View style={styles.inputUnderline} />
            </View>
            
            {/* Task Description Input */}
            <View style={styles.enhancedInputContainer}>
              <Text style={styles.enhancedInputLabel}>Description</Text>
              <TextInput
                style={[styles.enhancedInput, styles.enhancedTextArea]}
                placeholder="Add some details about this task..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                placeholderTextColor={colors.gray}
              />
              <View style={styles.inputUnderline} />
            </View>
            
            {/* Priority Selection */}
            <View style={styles.enhancedFormSection}>
              <Text style={styles.enhancedSectionTitle}>Priority Level</Text>
              <View style={styles.enhancedPriorityContainer}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.enhancedPriorityButton,
                      priority === p && styles.enhancedSelectedPriority,
                    ]}
                    onPress={() => setPriority(p)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.priorityIndicator,
                      { backgroundColor: priorityColors[p] }
                    ]} />
                    <Text style={[
                      styles.enhancedPriorityText,
                      priority === p && styles.enhancedSelectedPriorityText,
                    ]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                    {priority === p && (
                      <Text style={styles.priorityCheckmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Category Selection */}
            <View style={styles.enhancedFormSection}>
              <Text style={styles.enhancedSectionTitle}>Category</Text>
              <View style={styles.enhancedCategoryContainer}>
                {[
                  { name: 'Work', icon: '💼' },
                  { name: 'Personal', icon: '🏠' },
                  { name: 'Health', icon: '🏥' },
                  { name: 'Shopping', icon: '🛍️' }
                ].map((c) => (
                  <TouchableOpacity
                    key={c.name}
                    style={[
                      styles.enhancedCategoryButton,
                      category === c.name && styles.enhancedSelectedCategory,
                    ]}
                    onPress={() => setCategory(c.name)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryIcon}>{c.icon}</Text>
                    <Text style={[
                      styles.enhancedCategoryText,
                      category === c.name && styles.enhancedSelectedCategoryText,
                    ]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Due Date */}
            <View style={styles.enhancedFormSection}>
              <Text style={styles.enhancedSectionTitle}>Due Date</Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={styles.enhancedDateInput}
                  placeholder="YYYY-MM-DD"
                  value={dueDate}
                  onChangeText={setDueDate}
                  placeholderTextColor={colors.gray}
                />
                <Text style={styles.calendarIcon}>📅</Text>
              </View>
              {dueDate && (
                <Text style={styles.enhancedDatePreview}>
                  {formatDateForDisplay(dueDate)}
                </Text>
              )}
              <View style={styles.enhancedQuickDateButtons}>
                {[
                  { label: 'Today', days: 0 },
                  { label: 'Tomorrow', days: 1 },
                  { label: 'Next Week', days: 7 }
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    style={styles.enhancedQuickDateButton}
                    onPress={() => {
                      const targetDate = new Date();
                      targetDate.setDate(targetDate.getDate() + option.days);
                      setDueDate(targetDate.toISOString().split('T')[0]);
                    }}
                  >
                    <Text style={styles.enhancedQuickDateText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Reminder Toggle */}
            <View style={styles.enhancedFormSection}>
              <View style={styles.enhancedReminderHeader}>
                <View style={styles.reminderTitleContainer}>
                  <Text style={styles.enhancedSectionTitle}>Reminder</Text>
                  <Text style={styles.reminderSubtext}>Get notified before due date</Text>
                </View>
                <Switch
                  value={reminder}
                  onValueChange={setReminder}
                  trackColor={{ false: '#E5E7EB', true: colors.primary }}
                  thumbColor={reminder ? colors.white : '#9CA3AF'}
                  ios_backgroundColor="#E5E7EB"
                />
              </View>
            </View>
            
            {/* Reminder Time Selection */}
            {reminder && (
              <View style={styles.enhancedFormSection}>
                <Text style={styles.enhancedSectionTitle}>Reminder Time</Text>
                <Text style={styles.reminderTimeSubtext}>How early should we remind you?</Text>
                <View style={styles.enhancedReminderTimeContainer}>
                  {[
                    { value: '10min', label: '10 min before', icon: '⏰' },
                    { value: '15min', label: '15 min before', icon: '⏰' },
                    { value: '30min', label: '30 min before', icon: '🔔' },
                    { value: '1hour', label: '1 hour before', icon: '⏰' },
                    { value: '24hour', label: '1 day before', icon: '📆' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.enhancedReminderTimeButton,
                        reminderTime === option.value && styles.enhancedSelectedReminderTime,
                      ]}
                      onPress={() => setReminderTime(option.value as any)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reminderTimeIcon}>{option.icon}</Text>
                      <Text style={[
                        styles.enhancedReminderTimeText,
                        reminderTime === option.value && styles.enhancedSelectedReminderTimeText,
                      ]}>
                        {option.label}
                      </Text>
                      {reminderTime === option.value && (
                        <View style={styles.reminderTimeCheck}>
                          <Text style={styles.reminderTimeCheckText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Enhanced Footer */}
          <View style={styles.enhancedModalFooter}>
            <TouchableOpacity style={styles.enhancedCancelButton} onPress={onClose}>
              <Text style={styles.enhancedCancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.enhancedSaveButton} onPress={handleSave}>
              <View style={styles.saveButtonContent}>
                <Text style={styles.enhancedSaveButtonText}>
                  {editingTask ? 'Update Task' : 'Create Task'}
                </Text>
                <Text style={styles.saveButtonIcon}>✨</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
const scheduleNotification = async (task: Task) => {
  if (!task.reminder || !task.reminderTime) return;
  
  const reminderMinutes = {
    '10min': 10,
    '15min': 15,
    '30min': 30,
    '1hour': 60,
    '24hour': 1440,
  };
  
  const [year, month, day] = task.dueDate.split('-');
  const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const notificationDate = new Date(dueDate.getTime() - (reminderMinutes[task.reminderTime] * 60 * 1000));
  
  // Only schedule if notification time is in the future
  if (notificationDate > new Date()) {
    try {
      // Request permissions first
      await notifee.requestPermission();
      
      // Create a channel for Android
      const channelId = await notifee.createChannel({
        id: 'task-reminders',
        name: 'Task Reminders',
        importance: 4,
      });

      // Schedule the notification
      await notifee.createTriggerNotification(
        {
          id: task.id,
          title: '📋 Task Reminder',
          body: `${task.title} is due soon!`,
          data: {
            taskId: task.id,
          },
          android: {
            channelId,
            pressAction: {
              id: 'default',
            },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: notificationDate.getTime(),
        },
      );
      
      console.log(`✅ Scheduled notification for: ${task.title}`);
    } catch (error) {
      console.log('❌ Error scheduling notification:', error);
    }
  }
};

const cancelNotification = async (taskId: string) => {
  try {
    await notifee.cancelNotification(taskId);
    console.log('✅ Cancelled notification for task:', taskId);
  } catch (error) {
    console.log('❌ Error cancelling notification:', error);
  }
};
// Main App Component
// Main App Component
function App(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks'>('dashboard');
  const [tasksFilter, setTasksFilter] = useState<'all' | 'pending' | 'overdue' | 'today'>('all');

  // Save tasks to AsyncStorage
  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksToSave));
      console.log('Tasks saved to AsyncStorage');
    } catch (error) {
      console.log('Error saving tasks:', error);
    }
  };
  const requestNotificationPermissions = async () => {
  try {
    const settings = await notifee.requestPermission();
    console.log('Permission status:', settings.authorizationStatus);
  } catch (error) {
    console.log('Permission error:', error);
  }
};

  // Load tasks from AsyncStorage
  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
        console.log('Tasks loaded from AsyncStorage:', parsedTasks.length);
      }
    } catch (error) {
      console.log('Error loading tasks:', error);
    }
  };
useEffect(() => {
  requestNotificationPermissions();
  loadTasks();
}, []);

  // Save tasks whenever tasks change
  useEffect(() => {
    if (tasks.length > 0 || tasks.length !== initialTasks.length) {
      saveTasks(tasks);
    }
  }, [tasks]);
  const handleAddTask = (): void => {
    setEditingTask(null);
    setModalVisible(true);
  };

  const handleEditTask = (task: Task): void => {
    setEditingTask(task);
    setModalVisible(true);
  };

  const handleSaveTask = (task: Task): void => {
    if (editingTask) {
      // Cancel old notification if editing
      if (editingTask.reminder && editingTask.reminderTime) {
        cancelNotification(editingTask.id);
      }
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, task]);
    }
    
    // Schedule notification for new or updated tasks
    if (task.reminder && task.reminderTime) {
      scheduleNotification(task);
    }
  };

  const handleToggleTask = (taskId: string): void => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (taskId: string): void => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => {
            cancelNotification(taskId);
            setTasks(tasks.filter(t => t.id !== taskId));
          } 
        },
      ]
    );
  };

  const handleStatPress = (filter: 'pending' | 'overdue' | 'today'): void => {
    setTasksFilter(filter);
    setCurrentView('tasks');
  };

  const handleBackToDashboard = (): void => {
    setCurrentView('dashboard');
  };

  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {currentView === 'dashboard' ? (
        <>
          <DashboardHeader 
            totalTasks={tasks.length} 
            completedTasks={completedTasks}
          />
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <QuickStats tasks={tasks} onStatPress={handleStatPress} />
            
            <View style={styles.dashboardActions}>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  setTasksFilter('all');
                  setCurrentView('tasks');
                }}
              >
                <Text style={styles.viewAllText}>View All Tasks ({tasks.length})</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      ) : (
        <TasksView
          tasks={tasks}
          filter={tasksFilter}
          onBack={handleBackToDashboard}
          onToggle={handleToggleTask}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}

      <FloatingAddButton onPress={handleAddTask} />

      <TaskFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
    enhancedModalContent: {
    backgroundColor: colors.white,
    borderRadius: 24,
    width: width * 0.95,
    maxHeight: height * 0.9,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 25,
  },
  
  enhancedModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  headerIcon: {
    fontSize: 24,
  },
  
  headerTextContainer: {
    flex: 1,
  },
  
  enhancedModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.dark,
    marginBottom: 4,
  },
  
  enhancedModalSubtitle: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '400',
  },
  
  enhancedCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  enhancedCloseButtonText: {
    fontSize: 20,
    color: colors.gray,
    fontWeight: '600',
  },
  
  enhancedModalBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    maxHeight: height * 0.65,
  },
  
  // Enhanced Input Styles
  enhancedInputContainer: {
    marginBottom: 24,
  },
  
  enhancedInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 12,
  },
  
  enhancedInput: {
    fontSize: 16,
    color: colors.dark,
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  
  enhancedTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  inputUnderline: {
    height: 2,
    backgroundColor: `${colors.primary}20`,
    borderRadius: 1,
    marginTop: 8,
  },
  
  enhancedFormSection: {
    marginBottom: 32,
  },
  
  enhancedSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 16,
  },
  
  // Enhanced Priority Styles
  enhancedPriorityContainer: {
    gap: 12,
  },
  
  enhancedPriorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  enhancedSelectedPriority: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },
  
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  
  enhancedPriorityText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.dark,
    flex: 1,
  },
  
  enhancedSelectedPriorityText: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  priorityCheckmark: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Enhanced Category Styles
  enhancedCategoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  enhancedCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  
  enhancedSelectedCategory: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },
  
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  
  enhancedCategoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.dark,
  },
  
  enhancedSelectedCategoryText: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  // Enhanced Date Styles
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  enhancedDateInput: {
    flex: 1,
    fontSize: 16,
    color: colors.dark,
    fontWeight: '500',
  },
  
  calendarIcon: {
    fontSize: 20,
    marginLeft: 12,
  },
  
  enhancedDatePreview: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 12,
    paddingLeft: 20,
  },
  
  enhancedQuickDateButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  
  enhancedQuickDateButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  
  enhancedQuickDateText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray,
  },
  
  // Enhanced Reminder Styles
  enhancedReminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  reminderTitleContainer: {
    flex: 1,
  },
  
  reminderSubtext: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 2,
  },
  
  reminderTimeSubtext: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 16,
  },
  
  enhancedReminderTimeContainer: {
    gap: 10,
  },
  
  enhancedReminderTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  
  enhancedSelectedReminderTime: {
    backgroundColor: `${colors.primary}10`,
    borderColor: colors.primary,
  },
  
  reminderTimeIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  
  enhancedReminderTimeText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.dark,
    flex: 1,
  },
  
  enhancedSelectedReminderTimeText: {
    color: colors.primary,
    fontWeight: '600',
  },
  
  reminderTimeCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  reminderTimeCheckText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Enhanced Footer Styles
  enhancedModalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  
  enhancedCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  enhancedCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray,
  },
  
  enhancedSaveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  enhancedSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  
  saveButtonIcon: {
    fontSize: 16,
  },
  reminderTimeButtons: {
  flexDirection: 'column',
},
reminderTimeButton: {
  backgroundColor: colors.light,
  paddingHorizontal: 15,
  paddingVertical: 12,
  borderRadius: 8,
  marginBottom: 8,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: colors.light,
},
selectedReminderTime: {
  backgroundColor: colors.primary,
  borderColor: colors.primary,
},
reminderTimeButtonText: {
  fontSize: 14,
  color: colors.gray,
  fontWeight: '500',
},
selectedReminderTimeText: {
  color: colors.white,
  fontWeight: '600',
},
    dateContainer: {
    flexDirection: 'column',
  },
  fullDateText: {
    fontSize: 10,
    color: colors.gray,
    fontWeight: '400',
    marginTop: 2,
  },
  datePreview: {
    fontSize: 14,
    color: colors.primary,
    marginTop: -10,
    marginBottom: 10,
    fontWeight: '500',
  },
  quickDateButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  quickDateButton: {
    backgroundColor: colors.light,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  quickDateButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  dashboardHeader: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    marginTop: 20,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 16,
    color: colors.light,
    marginBottom: 20,
  },
  taskSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 15,
  },
  taskSummaryText: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  statCard: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIconText: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.dark,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
  },
  dashboardActions: {
    marginTop: 20,
    marginBottom: 100,
  },
  viewAllButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  viewAllText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  tasksViewContainer: {
    flex: 1,
  },
  tasksViewHeader: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  tasksViewTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  tasksCount: {
    color: colors.light,
    fontSize: 16,
    fontWeight: '500',
  },
  tasksViewContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  taskCard: {
    backgroundColor: colors.white,
    padding: 20,
    marginVertical: 8,
    borderRadius: 15,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  taskCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskCheckbox: {
    marginRight: 15,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskCardContent: {
    flex: 1,
  },
  taskCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray,
  },
  taskCardDescription: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
  },
  categoryBadge: {
    backgroundColor: colors.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: colors.gray,
  },
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 12,
    color: colors.gray,
    fontWeight: '500',
  },
  overdueText: {
    color: colors.error,
    fontWeight: 'bold',
  },
  taskActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  tasksList: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: colors.white,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.dark,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.gray,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: height * 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    marginBottom: 10,
  },
  priorityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedPriority: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryButton: {
    backgroundColor: colors.light,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryButtonText: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: colors.white,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: colors.light,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.gray,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
});

export default App;