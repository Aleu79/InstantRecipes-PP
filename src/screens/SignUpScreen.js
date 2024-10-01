import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../../firebase/firebase-config';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import zxcvbn from 'zxcvbn';
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore';
import { CommonActions } from '@react-navigation/native';
import { getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import Header from '../components/Headers/Header';

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

  const passwordStrength = password ? zxcvbn(password).score : -1;

  const getPasswordStrengthLabel = () => {
    switch (passwordStrength) {
      case 0: return { label: 'Muy débil', color: 'text-red-500' };
      case 1: return { label: 'Débil', color: 'text-orange-500' };
      case 2: return { label: 'Regular', color: 'text-yellow-500' };
      case 3: return { label: 'Bien', color: 'text-lime-500' };
      case 4: return { label: 'Seguro', color: 'text-green-500' };
      default: return { label: '', color: 'text-transparent' };
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
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        Alert.alert('Error', 'El correo electrónico ya está registrado. Intenta iniciar sesión.');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser({ email: user.email, username, phone });

      await sendEmailVerification(user);
      Alert.alert('Correo de verificación enviado', 'Por favor, revisa tu bandeja de entrada.');

      const userDoc = doc(collection(db, 'users'), email);
      await setDoc(userDoc, { username, phone, email });

      const intervalId = setInterval(async () => {
        await user.reload();
        if (user.emailVerified) {
          clearInterval(intervalId);
          setUser({ email: user.email, username, phone });
          Alert.alert('Cuenta verificada', 'Bienvenido a la aplicación');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            })
          );
        }
      }, 1000);
    } catch (error) {
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
    <>
      <View className="flex-1 justify-center items-center px-4 bg-[#F2F2F2]">
        <View className="w-full items-center mb-4">
          <Text className="text-4xl font-bold text-black mb-2 self-start ml-5">Bienvenido!</Text>
          <Text className="text-xl text-gray-400 mb-6 self-start ml-5">Registra tu cuenta</Text>

          <Text className="text-lg text-black self-start ml-5 mb-1">Usuario</Text>
          <TextInput
            className="w-11/12 h-12 border border-gray-200 rounded-full px-4 mb-4 bg-gray-200"
            placeholder="Usuario"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#666"
          />

          <Text className="text-lg text-black self-start ml-5 mb-1">E-mail</Text>
          <TextInput
            className="w-11/12 h-12 border border-gray-200 rounded-full px-4 mb-4 bg-gray-200"
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#666"
          />

          <Text className="text-lg text-black self-start ml-5 mb-1">Contraseña</Text>
          <View className="w-11/12 h-12 flex-row items-center border border-gray-200 rounded-full bg-gray-200 px-4 mb-4">
            <TextInput
              className="flex-1 text-base"
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#666" />
            </TouchableOpacity>
          </View>
          {password !== '' && (
            <Text className={`ml-5 ${getPasswordStrengthLabel().color}`}>
              {getPasswordStrengthLabel().label}
            </Text>
          )}

          <Text className="text-lg text-black self-start ml-5 mb-1">Repetir contraseña</Text>
          <View className="w-11/12 h-12 flex-row items-center border border-gray-200 rounded-full bg-gray-200 px-4 mb-4">
            <TextInput
              className="flex-1 text-base"
              placeholder="Repetir contraseña"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#666"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="w-4/5 h-12 bg-orange-500 justify-center items-center rounded-full my-4" onPress={handleSignUp}>
          <Text className="text-white text-lg font-bold">Registrar</Text>
        </TouchableOpacity>

        <Text className="text-base text-black">
          ¿Ya tienes una cuenta?{' '}
          <Text className="text-orange-500 font-bold" onPress={() => navigation.navigate('Login')}>
            Ingresá
          </Text>
        </Text>
      </View>
    </>
  );
};

export default SignUpScreen;
