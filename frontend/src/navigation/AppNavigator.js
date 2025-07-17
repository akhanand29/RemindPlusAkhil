import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HomeScreen from '../screens/HomeScreen';
import TaskListScreen from '../screens/TaskListScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddTask" 
      component={AddTaskScreen}
      options={{ 
        title: 'Add Task',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    />
    <Stack.Screen 
      name="EditTask" 
      component={EditTaskScreen}
      options={{ 
        title: 'Edit Task',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    />
  </Stack.Navigator>
);

const TaskStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="TaskList" 
      component={TaskListScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="AddTask" 
      component={AddTaskScreen}
      options={{ 
        title: 'Add Task',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    />
    <Stack.Screen 
      name="EditTask" 
      component={EditTaskScreen}
      options={{ 
        title: 'Edit Task',
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
      }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'TasksTab') {
            iconName = 'list';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.lightGray,
        },
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStack} 
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="TasksTab" 
        component={TaskStack} 
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;