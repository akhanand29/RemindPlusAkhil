// frontend/src/components/task/TaskList.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  StyleSheet, 
  Text, 
  RefreshControl,
  TouchableOpacity 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Searchbar, FAB, Menu, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TaskItem from './TaskItem';
import { fetchTasks } from '../../store/taskSlice';
import { COLORS } from '../../utils/constants';

const TaskList = ({ navigation, filter = 'all' }) => {
  const dispatch = useDispatch();
  const { tasks, loading, error } = useSelector(state => state.tasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter
    let matchesFilter = true;
    switch (filter) {
      case 'completed':
        matchesFilter = task.completed;
        break;
      case 'pending':
        matchesFilter = !task.completed;
        break;
      case 'overdue':
        matchesFilter = !task.completed && new Date(task.dueDate) < new Date();
        break;
      case 'today':
        const today = new Date();
        const taskDate = new Date(task.dueDate);
        matchesFilter = taskDate.toDateString() === today.toDateString();
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[a.priority?.toLowerCase()] || 0;
        bValue = priorityOrder[b.priority?.toLowerCase()] || 0;
        break;
      case 'dueDate':
      default:
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleTaskPress = (task) => {
    navigation.navigate('TaskDetail', { taskId: task._id });
  };

  const handleEditTask = (task) => {
    navigation.navigate('EditTask', { taskId: task._id });
  };

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const onRefresh = () => {
    dispatch(fetchTasks());
  };

  const renderTask = ({ item }) => (
    <TaskItem
      task={item}
      onPress={() => handleTaskPress(item)}
      onEdit={() => handleEditTask(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="task-alt" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyTitle}>No tasks found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try adjusting your search' : 'Tap the + button to add your first task'}
      </Text>
    </View>
  );

  const renderSortMenu = () => (
    <Menu
      visible={menuVisible}
      onDismiss={() => setMenuVisible(false)}
      anchor={
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => setMenuVisible(true)}
        >
          <Icon name="sort" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      }
    >
      <Menu.Item 
        onPress={() => {
          setSortBy('dueDate');
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          setMenuVisible(false);
        }}
        title={`Due Date ${sortBy === 'dueDate' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`}
      />
      <Menu.Item 
        onPress={() => {
          setSortBy('priority');
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          setMenuVisible(false);
        }}
        title={`Priority ${sortBy === 'priority' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`}
      />
      <Menu.Item 
        onPress={() => {
          setSortBy('title');
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          setMenuVisible(false);
        }}
        title={`Title ${sortBy === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}`}
      />
    </Menu>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        {renderSortMenu()}
      </View>

      <FlatList
        data={sortedTasks}
        renderItem={renderTask}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={sortedTasks.length === 0 && styles.emptyList}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddTask}
        color={COLORS.surface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    elevation: 2,
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
    elevation: 0,
  },
  sortButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyList: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default TaskList;