import { useNavigation, CommonActions } from '@react-navigation/native'; 
import { Alert, Image, Dimensions, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState, useContext } from 'react';
import { auth } from '../../firebase/firebase-config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation(); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  const { setUser } = useContext(UserContext);
  const db = getFirestore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
  
    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
      await AsyncStorage.setItem('userEmail', user.user.email); 
      const userDoc = doc(db, 'users', user.user.email);
      const userData = await getDoc(userDoc);
      const data = userData.data();
      setUser({ email: user.user.email, username: data.username, phone: data.phone });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    } catch (error) {
      console.log('Error completo:', error); 
      console.log('Código de error:', error.code); 
    
      switch (error.code) {
        case 'auth/wrong-password':
          Alert.alert('Error', 'La contraseña es incorrecta. Inténtalo de nuevo.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Error', 'El formato del correo no es válido.');
          break;
        case 'auth/too-many-requests':
          Alert.alert('Error', 'Demasiados intentos fallidos. Inténtalo más tarde.');
          break;
        case 'auth/invalid-credential':
          Alert.alert('Error', 'Las credenciales son inválidas. Revisa el correo o la contraseña e intenta nuevamente.');
          break;
        default:
          Alert.alert('Error', 'Ocurrió un error inesperado: ' + error.message);
      }
    }
  };
  

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor, ingresa tu correo para restablecer la contraseña.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Éxito', 'Se ha enviado un correo electrónico para restablecer tu contraseña.');
    } catch (error) {
      if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'El correo electrónico no es válido.');
      } else if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'No se encontró una cuenta con este correo electrónico.');
      } else {
        Alert.alert('Error', 'Ocurrió un error al enviar el correo electrónico para restablecer tu contraseña.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View style={styles.container}>
          <Image source={require('../../assets/login.jpg')} style={styles.backgroundImage} />
          <View style={styles.ondulatedBackground} /> 
          <View style={styles.form}>
            <Text style={styles.title}>Hola!</Text>
            <Text style={styles.subtitle}>Ingresa a tu cuenta</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Contraseña"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Ingresar</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              ¿No tienes una cuenta?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('Sign Up')}>
                Regístrate
              </Text>
            </Text>
            <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.5,
    resizeMode: 'cover',
  },

  ondulatedBackground: {
    position: 'absolute',
    top: height * 0.45, 
    left: 0,
    right: 0,
    height: 100, 
    backgroundColor: '#fdfdfd', 
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  forgotPasswordButton: {
    width: '80%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F2F2F2',
    top: height * 0.4,
  },
  form: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 65,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  subtitle: {
    fontSize: 20,
    color: '#aaaaaa',
    marginBottom: 24,
    alignSelf: 'flex-start',
    marginLeft: '5%',
  },
  input: {
    width: '90%',
    height: 55,
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 40,
    paddingHorizontal: 16,
    fontSize: 17,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    width: '90%',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 17,
  },  
  eyeIcon: {
    padding: 8,
  },
  button: {
    width: '80%',
    height: 55,
    backgroundColor: '#FF4500',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  footerLink: {
    color: '#FF4500',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default LoginScreen;
