// frontend/src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  Modal,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { Header } from '../components/common/Header';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';
import { COLORS, SIZES } from '../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkNotificationSettings();
  }, []);

  const checkNotificationSettings = async () => {
    try {
      const enabled = await notificationService.isNotificationEnabled();
      setNotificationsEnabled(enabled);
    } catch (error) {
      console.error('Error checking notification settings:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await authService.updateProfile(editData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (value) => {
    try {
      if (value) {
        await notificationService.requestPermission();
      } else {
        await notificationService.disableNotifications();
      }
      setNotificationsEnabled(value);
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await authService.deleteAccount();
              dispatch(logout());
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete account');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatar || 'https://via.placeholder.com/100' }}
              style={styles.avatar}
              defaultSource={require('../assets/default-avatar.png')}
            />
          </View>
          <Text style={styles.userName}>{user?.name || 'User Name'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <Input
                label="Name"
                value={editData.name}
                onChangeText={(text) => setEditData({ ...editData, name: text })}
                placeholder="Enter your name"
              />
              <Input
                label="Email"
                value={editData.email}
                onChangeText={(text) => setEditData({ ...editData, email: text })}
                placeholder="Enter your email"
                keyboardType="email-address"
              />
              <Button
                title="Update Profile"
                onPress={handleUpdateProfile}
                loading={loading}
                style={styles.updateButton}
              />
            </View>
          ) : (
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user?.name || 'Not set'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={notificationsEnabled ? COLORS.white : COLORS.gray}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowChangePassword(true)}
          >
            <Text style={styles.settingLabel}>Change Password</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Button
            title="Logout"
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton]}
            textStyle={styles.logoutText}
          />
          
          <Button
            title="Delete Account"
            onPress={handleDeleteAccount}
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteText}
          />
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChangePassword(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <View style={styles.modalSpacer} />
          </View>

          <View style={styles.modalContent}>
            <Input
              label="Current Password"
              value={passwordData.currentPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
              secureTextEntry
              placeholder="Enter current password"
            />
            
            <Input
              label="New Password"
              value={passwordData.newPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
              secureTextEntry
              placeholder="Enter new password"
            />
            
            <Input
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
              secureTextEntry
              placeholder="Confirm new password"
            />

            <Button
              title="Change Password"
              onPress={handleChangePassword}
              loading={loading}
              style={styles.changePasswordButton}
            />
          </View>
        </View>
      </Modal>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
  },
  section: {
    marginBottom: SIZES.padding * 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  editText: {
    color: COLORS.primary,
    fontSize: SIZES.body2,
  },
  editForm: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    elevation: 2,
  },
  updateButton: {
    marginTop: SIZES.padding,
  },
  infoContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: SIZES.body2,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginBottom: SIZES.padding / 2,
    borderRadius: SIZES.radius,
    elevation: 2,
  },
  settingLabel: {
    fontSize: SIZES.body2,
    color: COLORS.text,
  },
  settingArrow: {
    fontSize: SIZES.h2,
    color: COLORS.gray,
  },
  actionButton: {
    marginBottom: SIZES.padding,
  },
  logoutButton: {
    backgroundColor: COLORS.warning,
  },
  logoutText: {
    color: COLORS.white,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  deleteText: {
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalCancel: {
    color: COLORS.primary,
    fontSize: SIZES.body2,
  },
  modalTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalSpacer: {
    width: 60,
  },
  modalContent: {
    padding: SIZES.padding,
  },
  changePasswordButton: {
    marginTop: SIZES.padding,
  },
});

export default ProfileScreen;