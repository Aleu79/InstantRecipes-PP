import React, { useContext } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext'; 
import { UserContext } from '../context/UserContext';

const BottomNavBar = ({ navigation }) => {
  const { isDarkTheme } = useTheme(); 
  const { notifications } = useContext(UserContext);
  const unreadNotifications = notifications.filter(notification => !notification.read).length;

  return (
    <View style={[styles.navbar, isDarkTheme ? styles.darkNavbar : styles.lightNavbar]}>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('HomeScreen')}>
        <Icon name="home-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Notifications')}>
        <View style={styles.iconWrapper}>
          <Icon name="mail-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{unreadNotifications}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('SavedRecipes')}>
        <Icon name="bookmark-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('UserProfile')}>
        <Icon name="person-outline" size={30} color={isDarkTheme ? '#fff' : '#333'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  darkNavbar: {
    backgroundColor: '#121212',
    borderTopColor: '#333',
  },
  lightNavbar: {
    backgroundColor: '#fff',
    borderTopColor: '#ccc',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
  },
});

export default BottomNavBar;
