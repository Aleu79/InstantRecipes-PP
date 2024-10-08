import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  getAuth,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import zxcvbn from 'zxcvbn';
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore';

const db = getFirestore();

const { height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { setUser } = useContext(UserContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const passwordStrength = password ? zxcvbn(password).score : -1;

  const getPasswordStrengthLabel = () => {
    console.log('Verificando fortaleza de contraseña:', passwordStrength);
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

  const validateFields = () => {
    console.log('Validando campos:', { email, phone, username, password, confirmPassword });
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
    console.log('Campos validados correctamente');
    return true;
  };

  const handleVerifyEmail = async () => {
    console.log('Manejando verificación de correo...');
    if (!validateFields()) {
      console.log('Validación fallida');
      return;
    }
  
    const auth = getAuth();
    console.log('Firebase auth inicializado');
  
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      console.log('Métodos de inicio de sesión obtenidos para el correo:', signInMethods);
  
      if (signInMethods.length > 0) {
        Alert.alert('Error', 'El correo electrónico ya está registrado. Intenta iniciar sesión.');
        return;
      }
      console.log('Mostrando modal para aceptar términos');
      setModalVisible(true);
    } catch (error) {
      console.log('Error durante la verificación de correo:', error.message);
      Alert.alert('Error', error.message);
    }
  };
  
  const handleSignUp = async () => {
    console.log('Iniciando proceso de registro...');
    
    if (!termsAccepted) {
      console.log('Términos no aceptados');
      Alert.alert('Error', 'Debes aceptar los términos y condiciones para registrarte.');
      return;
    }
  
    const auth = getAuth();
    console.log('Firebase auth inicializado para el registro');
    
    try {
      // Crear usuario y enviar verificación de correo
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario creado:', user);
  
      await sendEmailVerification(user);
      console.log('Correo de verificación enviado');
      Alert.alert('Correo de verificación enviado', 'Por favor, revisa tu bandeja de entrada.');
      
      // Guardar información del usuario en Firestore
      const userDoc = doc(collection(db, 'users'), email);
      await setDoc(userDoc, { username, phone, email });
      console.log('Datos del usuario guardados en Firestore:', { username, phone, email });
  
      // Actualizar el estado global del usuario
      setUser({ email: user.email, username, phone });
      console.log('Estado del usuario actualizado:', { email: user.email, username, phone });
  
      // Verificar si el email está confirmado
      const checkVerificationInterval = setInterval(async () => {
        await auth.currentUser.reload();  // Actualiza la información del usuario
  
        if (auth.currentUser.emailVerified) {
          console.log('El correo ha sido verificado');
          Alert.alert('Verificación completa', 'Tu cuenta ha sido verificada. Bienvenido a la app.');
          clearInterval(checkVerificationInterval);
          navigation.navigate('Home');
        } else {
          console.log('El correo no ha sido verificado');
        }
      }, 1000);
  
    } catch (error) {
      console.log('Error durante el registro:', error.message);
      
      // Manejo del error de correo ya en uso
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'El correo electrónico ya está en uso. Intenta iniciar sesión o usa otro correo.');
      } else {
        Alert.alert('Error', error.message); // Maneja otros errores
      }
    }
  };
  
  const handleAcceptTerms = () => {
    console.log('Términos aceptados');
    setTermsAccepted(true);
    setModalVisible(false); // Cierra el modal
    handleSignUp(); // Llama al proceso de registro
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
        <View style={styles.ondulatedBackground}>
          <View style={styles.form}>
            <Text style={styles.title}>Bienvenido!</Text>
            <Text style={styles.subtitle}>Registra tu cuenta</Text>
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
        </View>
  
        <TouchableOpacity style={styles.button} onPress={handleVerifyEmail}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
  
        <Text style={styles.footerText}>
          ¿Ya tienes una cuenta?{' '}
          <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>
            Ingresá
          </Text>
        </Text>
  
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Términos y Condiciones</Text>
              <ScrollView style={styles.scrollContainer}>
                <Text style={styles.modalText}>
                <Text style={{ fontWeight: 'bold' }}>Última actualización: 4 de octubre de 2024</Text>{'\n'}

                  Al utilizar la aplicación de recetas InstantRecipes (en adelante, "la Aplicación"), aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con estos términos, por favor, no utilices la Aplicación.

                  <Text style={{ fontWeight: 'bold' }}>1.</Text> Aceptación de Términos
                  Al acceder y utilizar la Aplicación, aceptas que has leído, entendido y aceptado estar obligado por estos Términos y Condiciones. Estos términos pueden ser actualizados periódicamente, y se te notificará sobre cualquier cambio mediante la publicación de los nuevos términos en esta página.

                  <Text style={{ fontWeight: 'bold' }}>2.</Text> Uso de la API de Spoonacular
                  La Aplicación utiliza la API de Spoonacular para proporcionar recetas, información nutricional y otros datos relacionados con la cocina. Al utilizar nuestra Aplicación, también aceptas cumplir con los Términos de Servicio de Spoonacular, que puedes encontrar en su sitio web.

                  <Text style={{ fontWeight: 'bold' }}>3.</Text> Propiedad Intelectual
                  Todo el contenido de la Aplicación, incluyendo pero no limitándose a texto, imágenes, gráficos, logotipos, y software, es propiedad de InstantRecipes o de sus proveedores de contenido y está protegido por leyes de derechos de autor y otras leyes de propiedad intelectual. Queda prohibida la reproducción, distribución o modificación sin el permiso expreso del propietario.

                  <Text style={{ fontWeight: 'bold' }}>4.</Text> Limitación de Responsabilidad
                  La Aplicación se proporciona "tal cual" y "según disponibilidad". No garantizamos que la Aplicación esté libre de errores o interrupciones, ni que cumplirá con tus expectativas. No seremos responsables de ninguna pérdida o daño derivado del uso de la Aplicación o de la información contenida en ella.

                  <Text style={{ fontWeight: 'bold' }}>5.</Text> Modificaciones
                  Nos reservamos el derecho de modificar o interrumpir la Aplicación en cualquier momento, sin previo aviso. También podemos actualizar estos Términos y Condiciones en cualquier momento. Tu uso continuado de la Aplicación después de la publicación de cambios constituye tu aceptación de dichos cambios.

                  <Text style={{ fontWeight: 'bold' }}>6.</Text> Ley Aplicable
                  Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes del país en el que operamos, sin tener en cuenta sus principios de conflicto de leyes.
                </Text>
              </ScrollView>

              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTerms}>
                <Text style={styles.buttonText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
  },
  backgroundImage: {
    width: '100%',
    height: '40%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0, 
  },
  ondulatedBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#fdfdfd', 
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
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
    marginTop: 100,
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
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 50,
    borderColor: '#e6e6e6',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF4500',
    borderRadius: 25,
    width: '90%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  footerText: {
    fontSize: 16,
    color: '#000',
  },
  footerLink: {
    color: '#FF4500',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  acceptButton: {
    backgroundColor: '#FF4500',
    borderRadius: 25,
    width: '90%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 30,
  },
});

export default SignUpScreen;
