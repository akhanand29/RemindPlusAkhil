import React, { useState, useEffect, useRef } from 'react';
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

// Theme colors
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
  const pending = tasks.filter(t => !t.completed).length;
  const overdue = tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length;
  const today = tasks.filter(t => t.dueDate === new Date().toISOString().split('T')[0]).length;

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
        <Text style={styles.statNumber}>{today}</Text>
        <Text style={styles.statLabel}>Today</Text>
      </TouchableOpacity>
    </View>
  );
};

// Task Card Component
const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const isOverdue = !task.completed && new Date(task.dueDate) < new Date();

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `${diffDays} days left`;
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
            <Text style={[
              styles.dueDateText,
              isOverdue && styles.overdueText
            ]}>
              {formatDate(task.dueDate)}
            </Text>
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
    const today = new Date().toISOString().split('T')[0];
    
    switch (filter) {
      case 'pending':
        return tasks.filter(t => !t.completed);
      case 'overdue':
        return tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date());
      case 'today':
        return tasks.filter(t => t.dueDate === today);
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

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setPriority(editingTask.priority);
      setDueDate(editingTask.dueDate);
      setCategory(editingTask.category);
      setReminder(editingTask.reminder);
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setCategory('Personal');
      setReminder(true);
    }
  }, [editingTask, visible]);

  const handleSave = (): void => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const task: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      category,
      reminder,
      completed: editingTask ? editingTask.completed : false,
    };

    onSave(task);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.gray}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.gray}
            />
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Priority</Text>
              <View style={styles.priorityButtons}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      { backgroundColor: priorityColors[p] },
                      priority === p && styles.selectedPriority,
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={styles.priorityButtonText}>{p.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryButtons}>
                {['Work', 'Personal', 'Health', 'Shopping'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.categoryButton,
                      category === c && styles.selectedCategory,
                    ]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      category === c && styles.selectedCategoryText,
                    ]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              placeholder="Due date (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              placeholderTextColor={colors.gray}
            />
            
            <View style={styles.formRow}>
              <Text style={styles.sectionTitle}>Reminder</Text>
              <Switch
                value={reminder}
                onValueChange={setReminder}
                trackColor={{ false: colors.gray, true: colors.primary }}
                thumbColor={reminder ? colors.white : colors.light}
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main App Component
function App(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks'>('dashboard');
  const [tasksFilter, setTasksFilter] = useState<'all' | 'pending' | 'overdue' | 'today'>('all');

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
      setTasks(tasks.map(t => t.id === task.id ? task : t));
    } else {
      setTasks([...tasks, task]);
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
        { text: 'Delete', onPress: () => setTasks(tasks.filter(t => t.id !== taskId)) },
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