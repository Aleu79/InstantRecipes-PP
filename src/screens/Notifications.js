import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import Header from '../components/Headers/Header';
import BottomNavBar from '../components/BottomNavbar';
import { useNavigation } from '@react-navigation/native';

const Notifications = ({ navigation }) => {
  const { notifications, removeNotification, clearNotifications, readNotifications } = useContext(UserContext);
  const [selectedNotification, setSelectedNotification] = useState(null); 

  if (!notifications) {
    return <Text>Cargando...</Text>; 
  }

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onLongPress={() => handleLongPress(item)} 
    >
      <Icon name="notifications-outline" size={28} color="#4CAF50" style={styles.icon} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationBody}>{item.body}</Text>
        <Text style={styles.notificationDate}>{item.date}</Text>
      </View>
      {selectedNotification === item.id && (
        <View style={styles.actionsContainer}>
          <Icon
            name="trash-outline"
            size={20}
            color="#FF0000"
            onPress={() => handleRemoveNotification(item.id)} 
          />
        </View>
      )}
    </TouchableOpacity>
  );

  const handleLongPress = (item) => {
    setSelectedNotification(item.id === selectedNotification ? null : item.id); 
  };

  const handleRemoveNotification = (id) => {
    Alert.alert(
      'Eliminar Notificación',
      '¿Estás seguro de que deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', onPress: () => removeNotification(id) }
      ]
    );
    setSelectedNotification(null); 
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
      {readNotifications && readNotifications.length > 0 && (
        <View style={styles.readNotificationsContainer}>
          <Text style={styles.readNotificationsText}>Notificaciones Leídas:</Text>
          <FlatList
            data={readNotifications}
            renderItem={({ item }) => (
              <Text style={styles.readNotificationItem}>{item.title}</Text>
            )}
            keyExtractor={item => item.id}
          />
        </View>
      )}
      {notifications && notifications.length >= 2 && (
        <Icon
          name="trash-outline"
          size={28}
          color="#FF0000"
          onPress={handleClearNotifications}
        />
      )}
    </View>
    <BottomNavBar navigation={navigation}/>
   </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  noNotificationsText: {
    fontSize: 18,
    color: '#888',
    marginTop: 10,
  },
  readNotificationsContainer: {
    marginTop: 20,
  },
  readNotificationsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  readNotificationItem: {
    fontSize: 14,
    color: '#666',
  },
});

export default Notifications;
