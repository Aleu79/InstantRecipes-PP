import { useNavigation, CommonActions } from '@react-navigation/native'; // Asegúrate de importar CommonActions
import { Alert, Image, Dimensions, KeyboardAvoidingView, ScrollView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useState, useContext } from 'react';
import { auth } from '../../firebase/firebase-config';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation(); // Hook de navegación
  const [email, setEmail] = useState(''); // Estado para el email
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const { setUser } = useContext(UserContext);
  const db = getFirestore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña.');
      return;
    }

    try {
      const user = await signInWithEmailAndPassword(auth, email, password);
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
      console.log('Error completo:', error); // Ver el error completo
      console.log('Código de error:', error.code); // Imprimir el código de error para depuración

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
          Alert.alert('Error', 'Ocurrió un error inesperado. Por favor, inténtalo más tarde.');
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
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <View className="flex-1 bg-[#fdfdfd]">
          <Image source={require('../../assets/login.jpg')} className={`w-full h-[${height * 0.5}px]`} resizeMode="cover" />
          <View className={`absolute inset-0 bg-[#F2F2F2] top-[${height * 0.4}px]`} />
          <View className="flex-1 justify-start items-center px-5 py-10">
            <Text className="text-[65px] font-bold text-black mb-2 self-start ml-[5%]">Hola!</Text>
            <Text className="text-[20px] text-[#aaaaaa] mb-6 self-start ml-[5%]">Ingresa a tu cuenta</Text>
            <TextInput
              className="w-[90%] h-[55px] border-gray-200 border-[1px] rounded-[40px] px-4 text-[17px] mb-4 bg-gray-100"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
            <View className="w-[90%] h-[55px] flex-row items-center border-gray-200 border-[1px] rounded-[40px] bg-gray-100 px-4 mb-4">
              <TextInput
                className="flex-1 text-[17px]"
                placeholder="Contraseña"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                className="p-2"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#999" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity className="w-[80%] h-[55px] bg-[#FF4500] justify-center items-center rounded-[25px] my-4" onPress={handleLogin}>
              <Text className="text-white text-[18px] font-bold">Ingresar</Text>
            </TouchableOpacity>
            <Text className="text-[14px] text-black text-center mb-2">
              ¿No tienes una cuenta?{' '}
              <Text className="text-[#FF4500] font-bold" onPress={() => navigation.navigate('Sign Up')}>
                Regístrate
              </Text>
            </Text>
            <TouchableOpacity className="w-[80%] h-[30px] justify-center items-center mb-4" onPress={handleForgotPassword}>
              <Text className="text-[14px] text-blue-800 text-center">¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
