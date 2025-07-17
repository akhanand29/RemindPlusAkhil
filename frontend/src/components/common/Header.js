import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../utils/constants';

const Header = ({
  title,
  showBackButton = false,
  rightIcon,
  onRightIconPress,
  backgroundColor = COLORS.primary,
  textColor = COLORS.white,
}) => {
  const navigation = useNavigation();

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={backgroundColor === COLORS.primary ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
      />
      
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}
        
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            <Icon name={rightIcon} size={24} color={textColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    minHeight: 56,
  },
  backButton: {
    padding: SIZES.base,
    marginLeft: -SIZES.base,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONTS.h2.fontSize,
    fontWeight: FONTS.h2.fontWeight,
    marginHorizontal: SIZES.padding,
  },
  rightButton: {
    padding: SIZES.base,
    marginRight: -SIZES.base,
  },
});

export default Header;