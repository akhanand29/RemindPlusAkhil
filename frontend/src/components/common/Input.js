import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SIZES } from '../../utils/constants';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  editable = true,
  required = false,
  maxLength,
  autoCapitalize = 'none',
  autoCorrect = false,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getInputContainerStyle = () => {
    let containerStyle = [styles.inputContainer];
    
    if (isFocused) {
      containerStyle.push(styles.focusedContainer);
    }
    
    if (error) {
      containerStyle.push(styles.errorContainer);
    }
    
    if (!editable) {
      containerStyle.push(styles.disabledContainer);
    }
    
    return containerStyle;
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary : COLORS.gray}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
          >
            <Icon
              name={showPassword ? 'visibility-off' : 'visibility'}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
          >
            <Icon
              name={rightIcon}
              size={20}
              color={isFocused ? COLORS.primary : COLORS.gray}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.padding,
  },
  label: {
    fontSize: FONTS.body3.fontSize,
    fontWeight: FONTS.medium.fontWeight,
    color: COLORS.darkGray,
    marginBottom: SIZES.base,
  },
  required: {
    color: COLORS.red,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    paddingHorizontal: SIZES.padding,
    minHeight: 48,
  },
  focusedContainer: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  errorContainer: {
    borderColor: COLORS.red,
    borderWidth: 2,
  },
  disabledContainer: {
    backgroundColor: COLORS.lightGray2,
    borderColor: COLORS.lightGray,
  },
  input: {
    flex: 1,
    fontSize: FONTS.body3.fontSize,
    color: COLORS.darkGray,
    paddingVertical: SIZES.padding,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: SIZES.base,
  },
  rightIcon: {
    marginLeft: SIZES.base,
    padding: SIZES.base,
  },
  passwordToggle: {
    marginLeft: SIZES.base,
    padding: SIZES.base,
  },
  errorText: {
    fontSize: FONTS.body4.fontSize,
    color: COLORS.red,
    marginTop: SIZES.base / 2,
  },
});

export default Input;