import { useNavigation } from '@react-navigation/native';
import { Alert, Image, Dimensions, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState } from 'react';
import { auth } from '../../firebase/firebase-config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

const { height } = Dimensions.get('window');
const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home'); 
    } catch (error) {
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
          Alert.alert('Error', 'No se encontró una cuenta con este correo. Por favor, regístrate.');
          break;
        default:
          Alert.alert('Error', 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.');
      }
    }
  };
  const handleForgotPassword = async () => {
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
          <View style={styles.overlay} />
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
              <Text style={styles.forgotPasswordText}>Olvidaste tu contraseña?</Text>
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
    backgroundColor: '#F2F2F2',
  },
  backgroundImage: {
    width: '100%',
    height: height * 0.5,
    resizeMode: 'cover',
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
