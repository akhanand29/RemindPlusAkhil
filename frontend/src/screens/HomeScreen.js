// frontend/src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchTasks, updateTask } from '../store/taskSlice';
import Header from '../components/common/Header';
import TaskItem from '../components/task/TaskItem';
import { COLORS, SIZES } from '../utils/constants';
import { formatDate } from '../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { tasks, loading } = useSelector(state => state.tasks);
  const [refreshing, setRefreshing] = useState(false);

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  });

  const overdueTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    return taskDate < today && !task.completed;
  });

  const upcomingTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return taskDate > today && taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  });

  const completedTasks = tasks.filter(task => task.completed);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchTasks());
    }, [dispatch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTasks());
    setRefreshing(false);
  };

  const handleTaskToggle = async (taskId, completed) => {
    try {
      await dispatch(updateTask({
        id: taskId,
        updates: { completed: !completed }
      })).unwrap();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const TaskSection = ({ title, tasks, color = COLORS.primary, onViewAll }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
        <Text style={styles.taskCount}>{tasks.length}</Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>No tasks</Text>
      ) : (
        tasks.slice(0, 3).map(task => (
          <TaskItem
            key={task._id}
            task={task}
            onToggle={() => handleTaskToggle(task._id, task.completed)}
            onEdit={() => navigation.navigate('EditTask', { taskId: task._id })}
            compact
          />
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={`Hello, ${user?.name || 'User'}!`}
        showProfile
        onProfilePress={() => navigation.navigate('Profile')}
      />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="today" size={24} color={COLORS.primary} />
            <Text style={styles.statNumber}>{todayTasks.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="warning" size={24} color={COLORS.error} />
            <Text style={styles.statNumber}>{overdueTasks.length}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
          <View style={styles.statCard}>
            <Icon name="check-circle" size={24} color={COLORS.success} />
            <Text style={styles.statNumber}>{completedTasks.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {overdueTasks.length > 0 && (
          <TaskSection
            title="Overdue Tasks"
            tasks={overdueTasks}
            color={COLORS.error}
            onViewAll={() => navigation.navigate('TaskList', { filter: 'overdue' })}
          />
        )}

        <TaskSection
          title="Today's Tasks"
          tasks={todayTasks}
          onViewAll={() => navigation.navigate('TaskList', { filter: 'today' })}
        />

        <TaskSection
          title="Upcoming Tasks"
          tasks={upcomingTasks}
          color={COLORS.secondary}
          onViewAll={() => navigation.navigate('TaskList', { filter: 'upcoming' })}
        />

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddTask')}
          >
            <Icon name="add" size={24} color={COLORS.white} />
            <Text style={styles.actionText}>Add Task</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('TaskList')}
          >
            <Icon name="list" size={24} color={COLORS.primary} />
            <Text style={[styles.actionText, styles.secondaryText]}>View All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SIZES.padding,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    marginHorizontal: SIZES.base / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.black,
    marginTop: SIZES.base,
  },
  statLabel: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
    marginTop: SIZES.base / 2,
  },
  section: {
    marginBottom: SIZES.padding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    flex: 1,
  },
  taskCount: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginRight: SIZES.base,
  },
  viewAllText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: SIZES.padding,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.padding,
    paddingBottom: SIZES.padding,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SIZES.base / 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionText: {
    color: COLORS.white,
    fontSize: SIZES.body3,
    fontWeight: '600',
    marginLeft: SIZES.base,
  },
  secondaryText: {
    color: COLORS.primary,
  },
});

export default HomeScreen;