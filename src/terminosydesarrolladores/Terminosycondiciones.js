import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../../firebase/firebase-config'; 
import { doc, setDoc, getDoc } from 'firebase/firestore'; 
import { deleteField } from 'firebase/firestore'; 
import { UserContext } from '../context/UserContext';

const TerminosyCondiciones = () => {
  const { addNotification } = useContext(UserContext); 
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('25 de octubre de 2024');
  const navigation = useNavigation();
  const user = auth.currentUser; 

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.email);
        const userDoc = await getDoc(userDocRef);
        console.log("Documento de usuario:", userDoc.data());

        if (userDoc.exists() && userDoc.data().terminos) {
          setTermsAccepted(true);
          console.log("Términos aceptados previamente.");
        } else {
          console.log("El usuario no ha aceptado los términos aún.");
        }
      } else {
        console.log("No hay usuario autenticado.");
      }
    };

    checkTermsAcceptance();
  }, [user]);
  const handleTermsToggle = async () => {
    if (user) {
        try {
            const userDocRef = doc(db, 'users', user.email);
            
            // Si los términos están aceptados, eliminarlos de Firestore
            if (termsAccepted) {
                await setDoc(userDocRef, { terminos: deleteField() }, { merge: true });
                addNotification('Cambio de términos', 'Has rechazado los términos y condiciones.');
            } else {
                await setDoc(userDocRef, { terminos: true }, { merge: true });
                addNotification('Cambio de términos', 'Has aceptado los términos y condiciones.');
            }

            setTermsAccepted(!termsAccepted);
            console.log(`Términos ${termsAccepted ? 'rechazados' : 'aceptados'} y guardados en Firestore.`);
        } catch (error) {
            console.error('Error al guardar o eliminar términos en Firestore:', error);
            if (error.code === 'permission-denied') {
                Alert.alert('Error', 'No tienes permiso para guardar datos en Firestore.');
            } else {
                Alert.alert('Error', 'No se pudo guardar tu aceptación. Inténtalo nuevamente.');
            }
        }
    } else {
        Alert.alert('Error', 'No se encontró un usuario autenticado.');
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Términos y Condiciones</Text>
      <Text style={styles.lastUpdated}>
        <Text style={{ fontWeight: 'bold' }}>Última actualización: </Text>{lastUpdated}
      </Text>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.text}>
          Al registrarte en esta aplicación, aceptas los siguientes términos y
          condiciones:
          {"\n\n"}1. <Text style={{ fontWeight: 'bold' }}>Uso de los datos personales: </Text> Los datos proporcionados
          serán utilizados únicamente para gestionar tu cuenta.
          {"\n\n"}2. <Text style={{ fontWeight: 'bold' }}>Seguridad:</Text> Nos comprometemos a proteger la privacidad
          de tus datos y no compartirlos sin tu consentimiento.
          {"\n\n"}3. <Text style={{ fontWeight: 'bold' }}>Responsabilidad:</Text> No somos responsables del uso indebido
          de la app ni por violaciones de seguridad fuera de nuestro control.
          {"\n\n"}4. <Text style={{ fontWeight: 'bold' }}>Modificaciones:</Text> Podemos actualizar estos términos en
          cualquier momento y se notificará si hay cambios importantes.
          {"\n\n"}5. <Text style={{ fontWeight: 'bold' }}>Uso Adecuado:</Text> Los usuarios deben utilizar la aplicación
          respetando las leyes locales y los derechos de otros usuarios.
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.termsCheckbox,
          { borderColor: 'gray' },
        ]}
        onPress={handleTermsToggle} 
      >
        <Icon
          name={termsAccepted ? 'checkbox-outline' : 'square-outline'}
          size={24}
          color="#FF4500"
        />
        <Text style={styles.checkboxText}>
          Acepto los términos y condiciones
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.acceptButton,
          !termsAccepted ? { backgroundColor: 'gray' } : {},
        ]}
        onPress={termsAccepted ? () => navigation.goBack() : handleTermsToggle}
      >
        <Text style={styles.acceptButtonText}>
          {termsAccepted ? 'Volver' : 'Aceptar y Volver'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
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
    marginTop: 10,
  },
  lastUpdated: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  scrollContainer: {
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#333',
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
  },
  acceptButton: {
    backgroundColor: '#FF4500',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TerminosyCondiciones;
