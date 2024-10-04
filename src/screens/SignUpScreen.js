import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import zxcvbn from 'zxcvbn';
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';

const db = getFirestore();

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setUser } = useContext(UserContext);

  // Verificar la fortaleza de la contraseña
  const passwordStrength = password ? zxcvbn(password).score : -1;

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return { label: 'Muy débil', color: 'red' };
      case 1: return { label: 'Débil', color: 'orange' };
      case 2: return { label: 'Regular', color: 'yellow' };
      case 3: return { label: 'Bien', color: '#d2d72c' };
      case 4: return { label: 'Seguro', color: 'green' };
      default: return { label: '', color: 'transparent' };
    }
  };

  const validateFields = () => {
    if (!email || !phone || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateFields()) return;
  
    const auth = getAuth();
  
    try {
      // Verificar si el email ya está en uso
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        Alert.alert('Error', 'El correo electrónico ya está registrado. Intenta iniciar sesión.');
        return;
      }
  
      // Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser({ email: user.email, username, phone }); // Agregar el username al objeto user
  
      // Enviar correo de verificación
      await sendEmailVerification(user);
      Alert.alert('Correo de verificación enviado', 'Por favor, revisa tu bandeja de entrada.');
  
      // Guardar en Firestore
      const userDoc = doc(collection(db, 'users'), email);
      await setDoc(userDoc, { username, phone, email });
  
      // Verificar si el correo fue validado en segundo plano
      const intervalId = setInterval(async () => {
        await user.reload(); // Recarga el usuario para obtener el estado más reciente
        if (user.emailVerified) {
          clearInterval(intervalId); // Detenemos el chequeo
          setUser({ email: user.email, username, phone }); // Actualizar el objeto user con el username
          Alert.alert('Cuenta verificada', 'Bienvenido a la aplicación');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          );
        }
      }, 1000); // Chequear cada segundo si el correo fue verificado
    } catch (error) {
      // Control específico de errores
      switch (error.code) {
        case 'auth/email-already-in-use':
          Alert.alert('Error', 'El correo electrónico ya está en uso. Intenta iniciar sesión.');
          break;
        case 'auth/invalid-email':
          Alert.alert('Error', 'Correo no válido.');
          break;
        case 'auth/weak-password':
          Alert.alert('Error', 'Contraseña débil.');
          break;
        default:
          Alert.alert('Error', error.message);
          break;
      }
    }
  };
  return (
    <ScrollView >
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Bienvenido!</Text>
        <Text style={styles.subtitle}>Registra tu cuenta</Text>
        <Text style={styles.label}>Número de celular</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de celular"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#666"
        />
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#666"
        />
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#666"
        />
        <Text style={styles.label}>Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#666"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
        {password !== '' && (
          <Text style={{ color: getPasswordStrengthLabel().color, marginLeft: 20 }}>
            {getPasswordStrengthLabel().label}
          </Text>
        )}
        <Text style={styles.label}>Repetir contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Repetir contraseña"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#666"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>
        ¿Ya tienes una cuenta?{' '}
        <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>Ingresá</Text>
      </Text>
    </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F2',
  },
  form: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  subtitle: {
    fontSize: 20,
    color: '#aaaaaa',
    marginBottom: 24,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  label: {
    fontSize: 16,
    color: '#000',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 5,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    width: '90%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    width: '80%',
    height: 50,
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
  },
  footerLink: {
    color: '#FF4500',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
