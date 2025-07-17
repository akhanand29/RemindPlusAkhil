// frontend/src/components/task/TaskItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import { toggleTask, deleteTask } from '../../store/taskSlice';
import { formatDateTime } from '../../utils/helpers';

const TaskItem = ({ task, onPress, onEdit }) => {
  const dispatch = useDispatch();

  const handleToggle = () => {
    dispatch(toggleTask(task._id));
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteTask(task._id))
        }
      ]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#4ECDC4';
      case 'low': return '#45B7D1';
      default: return '#95A5A6';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Card style={[styles.card, task.completed && styles.completedCard]}>
      <TouchableOpacity onPress={onPress} style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
              <Icon 
                name={task.completed ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={task.completed ? '#4CAF50' : '#757575'}
              />
            </TouchableOpacity>
            <Text style={[
              styles.title,
              task.completed && styles.completedText
            ]}>
              {task.title}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Icon name="edit" size={20} color="#757575" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Icon name="delete" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>

        {task.description && (
          <Text style={[
            styles.description,
            task.completed && styles.completedText
          ]}>
            {task.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.priorityContainer}>
            <View 
              style={[
                styles.priorityDot,
                { backgroundColor: getPriorityColor(task.priority) }
              ]}
            />
            <Text style={styles.priorityText}>
              {task.priority || 'Normal'}
            </Text>
          </View>

          <View style={styles.dateContainer}>
            <Icon name="schedule" size={16} color={isOverdue ? '#F44336' : '#757575'} />
            <Text style={[
              styles.dateText,
              isOverdue && styles.overdueText
            ]}>
              {formatDateTime(task.dueDate)}
            </Text>
          </View>
        </View>

        {task.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>#{task.category}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    borderRadius: 12,
  },
  completedCard: {
    opacity: 0.7,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#95A5A6',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
  },
  description: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    color: '#7F8C8D',
    textTransform: 'capitalize',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  overdueText: {
    color: '#F44336',
    fontWeight: '600',
  },
  categoryContainer: {
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#3498DB',
    fontWeight: '500',
  },
});

export default TaskItem;