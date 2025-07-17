import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useDispatch } from 'react-redux';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { createTask, updateTask } from '../../store/taskSlice';
import { COLORS, SIZES } from '../../utils/constants';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium',
    category: 'personal',
    reminderTime: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        priority: task.priority || 'medium',
        category: task.category || 'personal',
        reminderTime: task.reminderTime ? new Date(task.reminderTime) : new Date(),
      });
    }
  }, [task]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.dueDate < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }
    
    if (formData.reminderTime >= formData.dueDate) {
      newErrors.reminderTime = 'Reminder time must be before due date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const taskData = {
        ...formData,
        dueDate: formData.dueDate.toISOString(),
        reminderTime: formData.reminderTime.toISOString(),
      };

      if (task) {
        await dispatch(updateTask({ id: task._id, taskData })).unwrap();
      } else {
        await dispatch(createTask(taskData)).unwrap();
      }

      onSubmit && onSubmit();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save task');
    }
  };

  const priorityColors = {
    low: COLORS.success,
    medium: COLORS.warning,
    high: COLORS.error,
  };

  const formatDate = (date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Input
          label="Task Title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          error={errors.title}
          placeholder="Enter task title"
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Enter task description"
          multiline
          numberOfLines={4}
          style={styles.descriptionInput}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {['low', 'medium', 'high'].map((priority) => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  formData.priority === priority && styles.priorityButtonActive,
                  { borderColor: priorityColors[priority] },
                ]}
                onPress={() => setFormData({ ...formData, priority })}
              >
                <Text
                  style={[
                    styles.priorityText,
                    formData.priority === priority && {
                      color: priorityColors[priority],
                    },
                  ]}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
              style={styles.picker}
            >
              <Picker.Item label="Personal" value="personal" />
              <Picker.Item label="Work" value="work" />
              <Picker.Item label="Health" value="health" />
              <Picker.Item label="Finance" value="finance" />
              <Picker.Item label="Education" value="education" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <View style={styles.dateButtonContent}>
            <Icon name="event" size={20} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>Due Date</Text>
            <Text style={styles.dateValue}>{formatDate(formData.dueDate)}</Text>
          </View>
        </TouchableOpacity>
        {errors.dueDate && <Text style={styles.errorText}>{errors.dueDate}</Text>}

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowReminderPicker(true)}
        >
          <View style={styles.dateButtonContent}>
            <Icon name="alarm" size={20} color={COLORS.primary} />
            <Text style={styles.dateButtonText}>Reminder Time</Text>
            <Text style={styles.dateValue}>{formatDate(formData.reminderTime)}</Text>
          </View>
        </TouchableOpacity>
        {errors.reminderTime && (
          <Text style={styles.errorText}>{errors.reminderTime}</Text>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={task ? 'Update Task' : 'Create Task'}
            onPress={handleSubmit}
            style={styles.submitButton}
          />
          <Button
            title="Cancel"
            onPress={onCancel}
            style={styles.cancelButton}
            variant="outline"
          />
        </View>
      </View>

      <DatePicker
        modal
        open={showDatePicker}
        date={formData.dueDate}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setFormData({ ...formData, dueDate: date });
        }}
        onCancel={() => setShowDatePicker(false)}
        minimumDate={new Date()}
        mode="datetime"
      />

      <DatePicker
        modal
        open={showReminderPicker}
        date={formData.reminderTime}
        onConfirm={(date) => {
          setShowReminderPicker(false);
          setFormData({ ...formData, reminderTime: date });
        }}
        onCancel={() => setShowReminderPicker(false)}
        minimumDate={new Date()}
        mode="datetime"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    padding: SIZES.padding,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: SIZES.base,
  },
  label: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    padding: SIZES.base,
    borderWidth: 1,
    borderRadius: SIZES.radius,
    marginHorizontal: SIZES.base / 2,
    alignItems: 'center',
  },
  priorityButtonActive: {
    backgroundColor: COLORS.lightGray,
  },
  priorityText: {
    fontSize: SIZES.font,
    color: COLORS.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
  },
  picker: {
    height: 50,
  },
  dateButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SIZES.base,
    flex: 1,
  },
  dateValue: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.font - 2,
    marginTop: -SIZES.base,
    marginBottom: SIZES.base,
  },
  buttonContainer: {
    marginTop: SIZES.padding,
  },
  submitButton: {
    marginBottom: SIZES.base,
  },
  cancelButton: {
    borderColor: COLORS.gray,
  },
});

export { TaskForm };