import React, { useState, useContext } from 'react';
import { Image, Dimensions, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../../firebase/firebase-config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Alert from '../components/Alerts/Alerts';
import { ALERT_TYPE } from 'react-native-alert-notification';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation(); 
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [showPassword, setShowPassword] = useState(false); 
  const [alert, setAlert] = useState({ visible: false, type: '', title: '', text: '' });
  const { setUser } = useContext(UserContext);
  const db = getFirestore();

  // Función para mostrar alertas
  const showAlert = (type, title, text) => {
    setAlert({
      visible: true,
      type: type,
      title: title,
      text: text,
    });
    setTimeout(() => setAlert({ visible: false, type: '', title: '', text: '' }), 4000); // Oculta la alerta después de 4 segundos
  };

  const handleLogin = async () => {
    // Validación de entrada
    if (!email.trim() || !password.trim()) {
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }
  
    try {
      // Intento de inicio de sesión
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      await AsyncStorage.setItem('userEmail', userCredential.user.email); 
      
      const userDoc = doc(db, 'users', userCredential.user.email);
      const userData = await getDoc(userDoc);
      
      if (userData.exists()) {
        const data = userData.data();
        setUser({ email: userCredential.user.email, username: data.username, phone: data.phone });
        
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      } else {
        showAlert(ALERT_TYPE.DANGER, 'Error', 'No se encontraron datos de usuario.');
      }
  
    } catch (error) {
      // Manejo de errores comunes
      switch (error.code) {
        case 'auth/wrong-password':
          showAlert(ALERT_TYPE.DANGER, 'Error', 'La contraseña es incorrecta. Inténtalo de nuevo.');
          break;
        case 'auth/invalid-email':
          showAlert(ALERT_TYPE.DANGER, 'Error', 'El formato del correo no es válido.');
          break;
        case 'auth/user-not-found':
          showAlert(ALERT_TYPE.DANGER, 'Error', 'No se encontró una cuenta con este correo electrónico.');
          break;
        case 'auth/too-many-requests':
          showAlert(ALERT_TYPE.WARNING, 'Error', 'Demasiados intentos fallidos. Inténtalo más tarde.');
          break;
        case 'auth/invalid-credential':
          showAlert(ALERT_TYPE.DANGER, 'Error', 'Las credenciales son inválidas. Revisa el correo o la contraseña e intenta nuevamente.');
          break;
        default:
          showAlert(ALERT_TYPE.DANGER, 'Error', `Ocurrió un error inesperado: ${error.message}`);
      }
    }
  };
  
  const handleForgotPassword = async () => {
    // Validación de entrada para recuperación de contraseña
    if (!email.trim()) {
      showAlert(ALERT_TYPE.WARNING, 'Error', 'Por favor, ingresa tu correo para restablecer la contraseña.');
      return;
    }
  
    try {
      // Envío de correo para restablecer la contraseña
      await sendPasswordResetEmail(auth, email.trim());
      showAlert(ALERT_TYPE.SUCCESS, 'Éxito', 'Se ha enviado un correo electrónico para restablecer tu contraseña.');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          showAlert(ALERT_TYPE.DANGER, 'Error', 'El correo electrónico no es válido.');
          break;
        case 'auth/user-not-found':
          showAlert(ALERT_TYPE.DANGER, 'Error', 'No se encontró una cuenta con este correo electrónico.');
          break;
        default:
          showAlert(ALERT_TYPE.DANGER, 'Error', `Ocurrió un error al enviar el correo electrónico: ${error.message}`);
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
        {alert.visible && (
          <Alert
            type={alert.type}
            title={alert.title}
            text={alert.text}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        )}
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
    backgroundColor: '#f5f5f5',
  },
  passwordContainer: {
    width: '90%',
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
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
