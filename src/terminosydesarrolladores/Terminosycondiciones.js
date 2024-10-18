import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Toast } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const TerminosyCondiciones = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('30 de octubre de 2024'); 
  const navigation = useNavigation();

  useEffect(() => {
    const checkForUpdates = async () => {
      const currentUpdateDate = '30 de octubre de 2024'; 
      try {
        const storedDate = await AsyncStorage.getItem('lastUpdateDate');
        const notificationShown = await AsyncStorage.getItem('notificationShown'); 

        // Solo muestra la notificación si la fecha cambió y aún no se mostró
        if ((!storedDate || storedDate !== currentUpdateDate) && !notificationShown) {
          Toast.show({
            type: 'warning',
            title: 'Términos y Condiciones Actualizados',
            textBody: 'Los términos y condiciones han sido actualizados.',
          });

          await AsyncStorage.setItem('lastUpdateDate', currentUpdateDate);
          await AsyncStorage.setItem('notificationShown', 'true'); 
        }
        setLastUpdated(currentUpdateDate);
      } catch (error) {
        console.error('Error al verificar actualizaciones:', error);
      }
    };

    checkForUpdates();
  }, []);

  const handleAcceptTerms = () => {
    Alert.alert('Éxito', 'Has aceptado los términos y condiciones.');
    setTermsAccepted(true);
    navigation.navigate('UserProfile'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Términos y Condiciones</Text>
      <Text style={styles.lastUpdated}>**Última actualización:** {lastUpdated}</Text>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.text}>
          Al registrarte en esta aplicación, aceptas los siguientes términos y condiciones:
          {"\n\n"}1. **Uso de los datos personales:** Los datos proporcionados serán utilizados
          únicamente para gestionar tu cuenta.
          {"\n\n"}2. **Seguridad:** Nos comprometemos a proteger la privacidad de tus datos y
          no compartirlos sin tu consentimiento.
          {"\n\n"}3. **Responsabilidad:** No somos responsables del uso indebido de la app ni por
          violaciones de seguridad fuera de nuestro control.
          {"\n\n"}4. **Modificaciones:** Podemos actualizar estos términos en cualquier momento y
          se notificará si hay cambios importantes.
          {"\n\n"}5. **Uso adecuado:** Los usuarios deben utilizar la aplicación respetando las leyes
          locales y los derechos de otros usuarios.
          {"\n\n"}Aceptando estos términos, confirmas haber leído y entendido nuestra política de privacidad.
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.termsCheckbox,
          !termsAccepted ? { borderColor: 'gray' } : {},
        ]}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <Icon
          name={termsAccepted ? 'checkbox-outline' : 'square-outline'}
          size={24}
          color="#FF4500"
        />
        <Text style={styles.checkboxText}>Acepto los términos y condiciones</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.acceptButton,
          !termsAccepted ? { backgroundColor: 'gray' } : {},
        ]}
        disabled={!termsAccepted}
        onPress={handleAcceptTerms}
      >
        <Text style={styles.acceptButtonText}>Aceptar y Volver</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    margin: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF4500',
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollContainer: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#FF4500',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TerminosyCondiciones;
