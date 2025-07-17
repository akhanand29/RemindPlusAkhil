import AsyncStorage from '@react-native-async-storage/async-storage';
import { MMKV } from 'react-native-mmkv';

// Initialize MMKV for faster, synchronous storage
const storage = new MMKV();

class StorageService {
  // AsyncStorage methods for large data
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  }

  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  }

  async clear() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // MMKV methods for small, frequently accessed data
  setSync(key, value) {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error storing sync data:', error);
    }
  }

  getSync(key) {
    try {
      const value = storage.getString(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error retrieving sync data:', error);
      return null;
    }
  }

  removeSync(key) {
    try {
      storage.delete(key);
    } catch (error) {
      console.error('Error removing sync data:', error);
    }
  }

  clearSync() {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('Error clearing sync storage:', error);
    }
  }

  // Specific methods for app data
  async setUserToken(token) {
    await this.setItem('userToken', token);
  }

  async getUserToken() {
    return await this.getItem('userToken');
  }

  async removeUserToken() {
    await this.removeItem('userToken');
  }

  async setUserData(userData) {
    await this.setItem('userData', userData);
  }

  async getUserData() {
    return await this.getItem('userData');
  }

  async removeUserData() {
    await this.removeItem('userData');
  }

  // Settings
  setAppSettings(settings) {
    this.setSync('appSettings', settings);
  }

  getAppSettings() {
    return this.getSync('appSettings') || {
      theme: 'light',
      notifications: true,
      soundEnabled: true,
      language: 'en',
      autoSync: true,
      reminderSound: 'default',
      vibrationEnabled: true,
      dailyDigest: true,
      weeklyReport: false,
      priorityAlerts: true,
      locationReminders: false,
      smartNotifications: true,
      workingHours: {
        enabled: false,
        start: '09:00',
        end: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    };
  }

  // Cache management
  async setCacheData(key, data, ttl = 3600000) { // 1 hour default TTL
    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl
    };
    await this.setItem(`cache_${key}`, cacheItem);
  }

  async getCacheData(key) {
    const cacheItem = await this.getItem(`cache_${key}`);
    if (!cacheItem) return null;

    const now = Date.now();
    if (now - cacheItem.timestamp > cacheItem.ttl) {
      await this.removeItem(`cache_${key}`);
      return null;
    }

    return cacheItem.data;
  }

  async clearCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Migration and backup
  async exportData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const data = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        data[key] = value;
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  async importData(data) {
    try {
      const pairs = Object.entries(data);
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Utility methods
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async getStorageSize() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        totalSize += new Blob([value]).size;
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
}

export default new StorageService();