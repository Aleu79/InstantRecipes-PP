import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebase/firebase-config';

const GoogleSignIn = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '980458678152-2mtr565ghshuppeer7cmasvvdmc1pgfu.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@aleu79/instantrecipes',
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          setUser(userCredential.user);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [response]);

  return (
    <TouchableOpacity
      onPress={() => promptAsync()}
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
