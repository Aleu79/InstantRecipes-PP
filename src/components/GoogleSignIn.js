import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebase/firebase-config';
import * as AuthSession from 'expo-auth-session';

const GoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '980458678152-2mtr565ghshuppeer7cmasvvdmc1pgfu.apps.googleusercontent.com',
    redirectUri: 'https://guticao.net.ar/callback',

  })

  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Redirect URI generado: ', AuthSession.makeRedirectUri({ useProxy: true }));
    console.log('Response received:', response); 

    if (response?.type === 'dismiss') {
      console.error('El usuario cerró el flujo de inicio de sesión o este falló.');
    } 
    else if (response?.type === 'success') {
      const { id_token } = response.params;
      console.log('Token ID recibido:', id_token);

      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          console.log('Usuario autenticado exitosamente:', userCredential.user);
          setUser(userCredential.user);
        })
        .catch((error) => {
          console.error('Error al iniciar sesión:', error.code, error.message);
        });
    } 
    else if (response?.type === 'error') {
      
      console.error('Ocurrió un error durante el inicio de sesión:', response.error);
    }
  }, [response]);

  return (
    <TouchableOpacity
      onPress={() => {
        console.log('Solicitando inicio de sesión con Google');
        promptAsync();
      }}
      disabled={!request}
      style={styles.button}>
      <Image
        source={require('../../assets/logogoogle.png')} 
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, 
  },
  image: {
    width: 50, 
    height: 50,
    resizeMode: 'contain', 
  },
});

export default GoogleSignIn;
