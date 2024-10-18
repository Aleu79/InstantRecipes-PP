import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Toast } from 'react-native-alert-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const TerminosyCondiciones = () => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('19 de octubre de 2024');
  const navigation = useNavigation();

  // Lógica para mostrar notificación si los términos son actualizados
  useEffect(() => {
    const checkForUpdates = async () => {
      const currentUpdateDate = '19 de octubre de 2024';
      
      // Obtener estado de notificación desde AsyncStorage
      const hasNotified = await AsyncStorage.getItem('hasNotified');

      if (currentUpdateDate !== lastUpdated && !hasNotified) {
        Toast.show({
          type: 'warning',
          title: 'Términos y Condiciones Actualizados',
          textBody: 'Los términos y condiciones han sido actualizados.',
        });

        // Marcar que la notificación ya fue mostrada
        await AsyncStorage.setItem('hasNotified', 'true');
        setLastUpdated(currentUpdateDate); 
      }
    };

    checkForUpdates();
  }, [lastUpdated]);

  const handleAcceptTerms = () => {
    Alert.alert('Éxito', 'Has aceptado los términos y condiciones.');
    setTermsAccepted(true);
    // Redirige a UserProfile
    navigation.navigate('UserProfile');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Términos y Condiciones</Text>
      <Text style={styles.lastUpdated}>**Última actualización:** {lastUpdated}</Text>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.text}>
          Al registrarte en esta aplicación, aceptas los siguientes términos y condiciones:
          {"\n\n"}1. **Uso de los datos personales:** Los datos personales proporcionados durante el
          registro serán utilizados únicamente con el propósito de gestionar tu cuenta en la aplicación.
          {"\n\n"}2. **Seguridad:** Nos comprometemos a proteger la privacidad de tus datos, y no compartiremos
          tu información con terceros sin tu consentimiento expreso.
          {"\n\n"}3. **Responsabilidad:** No somos responsables por el uso indebido de esta aplicación ni por
          la divulgación accidental de información personal debido a violaciones de seguridad fuera de nuestro
          control.
          {"\n\n"}4. **Modificaciones:** Nos reservamos el derecho de actualizar estos términos en cualquier
          momento. Te notificaremos si realizamos cambios sustanciales.
          {"\n\n"}5. **Uso adecuado:** Los usuarios se comprometen a utilizar la aplicación de manera adecuada,
          respetando las leyes locales y los derechos de otros usuarios.
          {"\n\n"}Al aceptar estos términos, confirmas que has leído y comprendido nuestra política de privacidad.
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
