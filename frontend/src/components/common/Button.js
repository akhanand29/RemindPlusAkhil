import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SIZES } from '../../utils/constants';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    let buttonStyle = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'secondary':
        buttonStyle.push(styles.secondaryButton);
        break;
      case 'outline':
        buttonStyle.push(styles.outlineButton);
        break;
      case 'danger':
        buttonStyle.push(styles.dangerButton);
        break;
      case 'success':
        buttonStyle.push(styles.successButton);
        break;
      default:
        buttonStyle.push(styles.primaryButton);
    }
    
    // Size styles
    switch (size) {
      case 'small':
        buttonStyle.push(styles.smallButton);
        break;
      case 'large':
        buttonStyle.push(styles.largeButton);
        break;
      default:
        buttonStyle.push(styles.mediumButton);
    }
    
    // State styles
    if (disabled) {
      buttonStyle.push(styles.disabledButton);
    }
    
    if (fullWidth) {
      buttonStyle.push(styles.fullWidthButton);
    }
    
    return buttonStyle;
  };

  const getTextStyle = () => {
    let textStyleArray = [styles.buttonText];
    
    // Variant text styles
    switch (variant) {
      case 'secondary':
        textStyleArray.push(styles.secondaryButtonText);
        break;
      case 'outline':
        textStyleArray.push(styles.outlineButtonText);
        break;
      case 'danger':
        textStyleArray.push(styles.dangerButtonText);
        break;
      case 'success':
        textStyleArray.push(styles.successButtonText);
        break;
      default:
        textStyleArray.push(styles.primaryButtonText);
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        textStyleArray.push(styles.smallButtonText);
        break;
      case 'large':
        textStyleArray.push(styles.largeButtonText);
        break;
      default:
        textStyleArray.push(styles.mediumButtonText);
    }
    
    if (disabled) {
      textStyleArray.push(styles.disabledButtonText);
    }
    
    return textStyleArray;
  };

  const getIconColor = () => {
    if (disabled) return COLORS.gray;
    
    switch (variant) {
      case 'outline':
        return COLORS.primary;
      case 'secondary':
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? COLORS.primary : COLORS.white}
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && iconPosition === 'left' && (
            <Icon
              name={icon}
              size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <Icon
              name={icon}
              size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
              color={getIconColor()}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: FONTS.medium.fontWeight,
    textAlign: 'center',
  },
  
  // Variants
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.lightGray,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dangerButton: {
    backgroundColor: COLORS.red,
  },
  successButton: {
    backgroundColor: COLORS.green,
  },
  
  // Sizes
  smallButton: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: SIZES.padding * 1.5,
    paddingVertical: SIZES.padding,
    minHeight: 48,
  },
  largeButton: {
    paddingHorizontal: SIZES.padding * 2,
    paddingVertical: SIZES.padding * 1.5,
    minHeight: 56,
  },
  
  // Text variants
  primaryButtonText: {
    color: COLORS.white,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  outlineButtonText: {
    color: COLORS.primary,
  },
  dangerButtonText: {
    color: COLORS.white,
  },
  successButtonText: {
    color: COLORS.white,
  },
  
  // Text sizes
  smallButtonText: {
    fontSize: FONTS.body4.fontSize,
  },
  mediumButtonText: {
    fontSize: FONTS.body3.fontSize,
  },
  largeButtonText: {
    fontSize: FONTS.body2.fontSize,
  },
  
  // States
  disabledButton: {
    backgroundColor: COLORS.lightGray,
    elevation: 0,
    shadowOpacity: 0,
  },
  disabledButtonText: {
    color: COLORS.gray,
  },
  
  // Layout
  fullWidthButton: {
    width: '100%',
  },
  
  // Icons
  leftIcon: {
    marginRight: SIZES.base,
  },
  rightIcon: {
    marginLeft: SIZES.base,
  },
});

export default Button;