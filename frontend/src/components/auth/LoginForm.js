import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { login } from '../../store/authSlice';
import { COLORS, SIZES } from '../../utils/constants';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(login(formData)).unwrap();
      onSuccess && onSuccess();
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Please check your credentials');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.inputContainer}>
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            error={errors.email}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Icon name="email" size={20} color={COLORS.gray} />}
          />

          <View style={styles.passwordContainer}>
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              error={errors.password}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              leftIcon={<Icon name="lock" size={20} color={COLORS.gray} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
              }
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={onSwitchToRegister}
          >
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  form: {
    flex: 1,
    padding: SIZES.padding,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
  },
  subtitle: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: SIZES.padding,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    padding: SIZES.base / 2,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: SIZES.base,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: SIZES.font,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: SIZES.padding,
  },
  loginButton: {
    marginBottom: SIZES.padding,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    marginHorizontal: SIZES.padding,
    color: COLORS.gray,
    fontSize: SIZES.font,
  },
  registerButton: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export { LoginForm };