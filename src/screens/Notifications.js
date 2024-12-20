import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import { Swipeable } from 'react-native-gesture-handler';
import Header from '../components/Headers/Header';
import BottomNavBar from '../components/BottomNavbar';

const Notifications = ({ navigation }) => {
  const { notifications, removeNotification, clearNotifications, setNotifications } = useContext(UserContext);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      notifications.forEach(notification => {
        if (!notification.read) {
          handleReadNotification(notification.id);
        }
      });
    }
  }, [notifications]);

  const renderNotification = ({ item }) => {
    const renderRightActions = () => (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleRemoveNotification(item.id)}
      >
        <Icon name="trash-outline" size={24} color="#fff" />
      </TouchableOpacity>
    );

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={styles.notificationItem}
          onLongPress={() => handleLongPress(item)}
        >
          <Icon
            name="notifications-outline"
            size={28}
            color="#4CAF50"
            style={styles.icon}
          />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <Text style={styles.notificationDate}>{item.date}</Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  const handleLongPress = (item) => {
    setSelectedNotification(item.id === selectedNotification ? null : item.id);
  };
  const handleRemoveNotification = (id) => {
    removeNotification(id);
    setSelectedNotification(null);
  };

  const handleReadNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const handleClearNotifications = () => {
    Alert.alert(
      'Limpiar Notificaciones',
      '¿Estás seguro de que deseas limpiar todas las notificaciones?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', onPress: () => {
          clearNotifications();
          setSelectedNotification(null);
        }}
      ]
    );
  };

  return (
    <>
      <View style={styles.container}>
        <Header
          title="Notificaciones"
          leftIcon={
            <Icon
              name="arrow-back"
              size={28}
              color="#333"
              onPress={() => navigation.goBack()}
            />
          }
        />
        {notifications && notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.noNotificationsContainer}>
            <Icon name="notifications-off" size={50} color="#888" />
            <Text style={styles.noNotificationsText}>No hay notificaciones</Text>
          </View>
        )}
        {notifications && notifications.length >= 2 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearNotifications}>
            <Icon name="trash-outline" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
      <BottomNavBar navigation={navigation} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    backgroundColor: '#FF6347',
    borderRadius: 10,
    marginVertical: 5,
  },
  icon: {
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotificationsText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  clearButton: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: '#FF6347',
    borderRadius: 50,
    padding: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default Notifications;
