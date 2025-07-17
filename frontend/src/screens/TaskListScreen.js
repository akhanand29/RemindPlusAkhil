import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../components/common/Header';
import TaskList from '../components/task/TaskList';
import { fetchTasks } from '../store/taskSlice';
import { COLORS, FONTS } from '../utils/constants';

const TaskListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector((state) => state.tasks);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTasks());
    setRefreshing(false);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const filterButtons = [
    { key: 'all', label: 'All', count: tasks.length },
    { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.completed).length },
    { key: 'completed', label: 'Completed', count: tasks.filter(t => t.completed).length },
  ];

  return (
    <View style={styles.container}>
      <Header title="My Tasks" />
      
      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {filterButtons.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterButton,
              filter === item.key && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(item.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === item.key && styles.activeFilterButtonText,
              ]}
            >
              {item.label} ({item.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="task-alt" size={80} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>
              {filter === 'all' 
                ? 'No tasks yet. Create your first task!' 
                : `No ${filter} tasks found.`}
            </Text>
          </View>
        ) : (
          <TaskList 
            tasks={filteredTasks} 
            onTaskPress={(task) => navigation.navigate('EditTask', { task })}
          />
        )}
      </ScrollView>

      {/* Add Task Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTask')}
      >
        <Icon name="add" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  activeFilterButtonText: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: COLORS.error,
    margin: 16,
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.white,
    textAlign: 'center',
    fontFamily: FONTS.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 16,
    fontFamily: FONTS.regular,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

export default TaskListScreen;