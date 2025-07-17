import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import TaskForm from '../components/task/TaskForm';
import { createTask } from '../store/taskSlice';
import { COLORS } from '../utils/constants';
import { showToast } from '../utils/helpers';

const AddTaskScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (taskData) => {
    setLoading(true);
    try {
      await dispatch(createTask(taskData)).unwrap();
      showToast('Task created successfully!', 'success');
      navigation.goBack();
    } catch (error) {
      showToast(error.message || 'Failed to create task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Task Creation',
      'Are you sure you want to cancel? All changes will be lost.',
      [
        { text: 'Continue Editing', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

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
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
          submitButtonText="Create Task"
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
});

export default AddTaskScreen;