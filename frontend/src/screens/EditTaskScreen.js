import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import TaskForm from '../components/task/TaskForm';
import { updateTask, deleteTask } from '../store/taskSlice';
import { COLORS, FONTS } from '../utils/constants';
import { showToast } from '../utils/helpers';

const EditTaskScreen = ({ navigation, route }) => {
  const { task } = route.params;
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (taskData) => {
    setLoading(true);
    try {
      await dispatch(updateTask({ id: task._id, updates: taskData })).unwrap();
      showToast('Task updated successfully!', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(error.message || 'Failed to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            setLoading(true);
            try {
              await dispatch(deleteTask(task._id)).unwrap();
              showToast('Task deleted successfully!', 'success');
              navigation.goBack();
            } catch (error) {
              showToast(error.message || 'Failed to delete task', 'error');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Changes',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={loading}
        >
          <Icon name="delete" size={24} color={COLORS.error} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, loading]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TaskForm
          initialData={task}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          submitButtonText="Update Task"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  deleteButton: {
    marginRight: 16,
    padding: 8,
  },
});

export default EditTaskScreen;