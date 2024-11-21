import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Headers/Header';

const DevelopersScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Desarrolladores" goBack={() => navigation.goBack()} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.iconTextContainer}>
          <Icon name="code-slash-outline" size={40} color="#4CAF50" />
          <Text style={styles.titleText}>Desarrolladores</Text>
        </View>

        <Icon name="construct-outline" size={200} color="#4CAF50" style={styles.icon} />

        <Text style={styles.infoText}>
          Aún no tenemos información sobre desarrolladores en esta sección.
        </Text>

        <Text style={styles.footerText}>
          ¡Estén atentos! Pronto actualizaremos esta sección con más detalles.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  headerContainer: {
    marginTop: 32,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  icon: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 8,
  },
  footerText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
  },
});

export default DevelopersScreen;
