import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Headers/Header';

const DevelopersScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.customHeader}>
        <Header title="Desarrolladores" goBack={() => navigation.goBack()} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="code-slash-outline" size={40} color="#4CAF50" /> 
          <Text style={styles.title}>Desarrolladores</Text>
        </View>

        <Icon name="construct-outline" size={150} color="#4CAF50" style={styles.icon} />  

        <Text style={styles.message}>
          Aún no tenemos información sobre desarrolladores en esta sección.
        </Text>

        <Text style={styles.subMessage}>
          ¡Estén atentos! Pronto actualizaremos esta sección con más detalles.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',  
  },
  customHeader: {
    marginTop: 30, 
    marginBottom: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333', 
    marginLeft: 10,
  },
  icon: {
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',  
    marginBottom: 10,
  },
  subMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',  
  },
});

export default DevelopersScreen;
