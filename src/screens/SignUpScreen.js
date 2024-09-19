import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../../firebase/firebase-config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import zxcvbn from 'zxcvbn'; // Importamos zxcvbn para medir la seguridad de la contraseña

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { setUser } = useContext(UserContext);

  // Función para obtener la fortaleza de la contraseña
  const passwordStrength = password ? zxcvbn(password).score : -1;

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0:
        return { label: 'Muy débil', color: 'red' };
      case 1:
        return { label: 'Débil', color: 'orange' };
      case 2:
        return { label: 'Regular', color: 'yellow' };
      case 3:
        return { label: 'Bien', color: '#d2d72c' };
      case 4:
        return { label: 'Seguro', color: 'green' };
      default:
        return { label: '', color: 'transparent' };
    }
  };

  const handleSignUp = async () => {
    if (email && phone && username && password && confirmPassword) {
      if (password === confirmPassword) {
        if (password.length >= 8) {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
            setUser({ username });
            Alert.alert('Éxito', 'Registro exitoso');
            navigation.navigate('Home');
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        } else {
          Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
        }
      } else {
        Alert.alert('Error', 'Las contraseñas no coinciden');
      }
    } else {
      Alert.alert('Error', 'Por favor completa todos los campos');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Bienvenido!</Text>
        <Text style={styles.subtitle}>Registra tu cuenta</Text>

        <Text style={styles.label}>Ingresá tu número de celular</Text>
        <TextInput
          style={styles.input}
          placeholder="Número de celular"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Ingresá tu usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Ingresá tu e-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Ingresá tu contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        {/* Mostrar la fortaleza de la contraseña */}
        {password !== '' && (
          <Text style={{ color: getPasswordStrengthLabel().color, marginLeft: 20 }}>
            {getPasswordStrengthLabel().label}
          </Text>
        )}

        <Text style={styles.label}>Repetí la contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
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
  eyeIcon: {
    padding: 8,
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
    textAlign: 'center',
  },
  footerLink: {
    color: '#FF4500',
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
