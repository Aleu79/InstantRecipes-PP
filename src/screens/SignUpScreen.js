import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  getAuth,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { UserContext } from '../context/UserContext';
import { getFirestore, setDoc, doc, collection } from 'firebase/firestore';
import Alert from '../components/Alerts/Alerts'; 
import { ALERT_TYPE } from 'react-native-alert-notification';

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
  const [alert, setAlert] = useState({ visible: false, type: '', title: '', text: '' });
  const [passwordStrength, setPasswordStrength] = useState(''); 

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength === 5) return 'Muy fuerte';
    if (strength >= 3) return 'Fuerte';
    if (strength === 2) return 'Moderada';
    return 'Débil';
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const showAlert = (type, title, text) => {
    setAlert({
      visible: true,
      type: type,
      title: title,
      text: text,
    });
    setTimeout(() => setAlert({ visible: false, type: '', title: '', text: '' }), 4000);
  };

  const validateFields = () => {
    if (!email || !username || !password || !confirmPassword) {
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Por favor completa todos los campos');
      return false;
    }
    if (password !== confirmPassword) {
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Las contraseñas no coinciden');
      return false;
    }
    if (password.length < 8) {
      showAlert(ALERT_TYPE.DANGER, 'Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    return true;
  };

  const handleVerifyEmail = async () => {
    if (!validateFields()) return;

    const auth = getAuth();
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        showAlert(ALERT_TYPE.DANGER, 'Error', 'El correo electrónico ya está registrado.');
        return;
      }
      setModalVisible(true);
    } catch (error) {
      showAlert(ALERT_TYPE.DANGER, 'Error', error.message);
    }
  };

  const handleSignUp = async () => {
    if (!termsAccepted) {
      showAlert(ALERT_TYPE.DANGER, 'Error', 'Debes aceptar los términos y condiciones para registrarte.');
      return;
    }
    const auth = getAuth();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      showAlert(ALERT_TYPE.SUCCESS, 'Éxito', 'Correo de verificación enviado.');
      
      const userDoc = doc(collection(db, 'users'), email);
      await setDoc(userDoc, { username, phone, email });
      setUser({ email: user.email, username, phone });

      const checkVerificationInterval = setInterval(async () => {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          showAlert(ALERT_TYPE.SUCCESS, 'Verificación completa', 'Cuenta verificada.');
          clearInterval(checkVerificationInterval);
          navigation.navigate('HomeScreen');
        }
      }, 1000);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showAlert(ALERT_TYPE.DANGER, 'Error', 'El correo ya está en uso.');
      } else {
        showAlert(ALERT_TYPE.DANGER, 'Error', error.message);
      }
    }
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setModalVisible(false);
    handleSignUp();
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
            <Text style={styles.title}>¡Bienvenido!</Text>
            <Text style={styles.subtitle}>Crea tu cuenta    </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Usuario"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#999"
            />
  
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
  
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirmar contraseña"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#999" />
              </TouchableOpacity>
            </View>
  
            <View style={styles.passwordStrengthContainer}>
              {password ? (
                <Text style={styles.passwordStrengthText}>Fortaleza: {passwordStrength}</Text>
              ) : null}
            </View>
  
            <TouchableOpacity style={styles.button} onPress={handleVerifyEmail}>
              <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity>
  
            <Text style={styles.footerText}>
              ¿Ya tienes una cuenta?{' '}
              <Text style={styles.footerLink} onPress={() => navigation.navigate('Login')}>Inicia sesión     </Text>
              <Alert visible={alert.visible} type={alert.type} title={alert.title} text={alert.text} />
            </Text>
  
            <TouchableOpacity style={styles.termsContainer} onPress={() => setModalVisible(true)}>
              <Icon name="document-text-outline" size={20} color="#FF4500" />
              <Text style={styles.termsText}>Términos y condiciones de uso    </Text>
            </TouchableOpacity>
          </View>
  
          <Modal animationType="slide" transparent={true} visible={modalVisible}>
            <View style={styles.modalBackground}>
              <View style={styles.modalView}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Icon name="arrow-back-outline" size={24} color="#FF4500" />
                </TouchableOpacity>
  
                <Text style={styles.modalTitle}>Términos y Condiciones</Text>
                <Text style={styles.modalText}>
                  {"\n\n"}**Última actualización:** 17 de octubre de 2024
                </Text>
                
                <ScrollView style={styles.scrollContainer}>
                  <Text style={styles.modalText}>
                    Al registrarte en esta aplicación, aceptas los siguientes términos y condiciones:
                    {"\n\n"}1. **Uso de los datos personales:** Los datos personales proporcionados durante el
                    registro serán utilizados únicamente con el propósito de gestionar tu cuenta en la aplicación.
                    {"\n\n"}2. **Seguridad:** Nos comprometemos a proteger la privacidad de tus datos, y no compartiremos
                    tu información con terceros sin tu consentimiento expreso.
                    {"\n\n"}3. **Responsabilidad:** No somos responsables por el uso indebido de esta aplicación ni por
                    la divulgación accidental de información personal debido a violaciones de seguridad fuera de nuestro
                    control.
                    {"\n\n"}4. **Modificaciones:** Nos reservamos el derecho de actualizar estos términos en cualquier
                    momento. Te notificaremos si realizamos cambios sustanciales.
                    {"\n\n"}5. **Uso adecuado:** Los usuarios se comprometen a utilizar la aplicación de manera adecuada,
                    respetando las leyes locales y los derechos de otros usuarios.
                    {"\n\n"}Al aceptar estos términos, confirmas que has leído y comprendido nuestra política de privacidad.
                  </Text>
                </ScrollView>
  
                <TouchableOpacity
                  style={[
                    styles.termsCheckbox,
                    !termsAccepted ? { borderColor: 'gray' } : {},
                  ]}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  <Icon
                    name={termsAccepted ? 'checkbox-outline' : 'square-outline'}
                    size={24}
                    color="#FF4500"
                  />
                  <Text style={styles.checkboxText}>Acepto los términos y condiciones   </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.acceptButton,
                    !termsAccepted ? { backgroundColor: 'gray' } : {},
                  ]}
                  disabled={!termsAccepted}
                  onPress={handleAcceptTerms}
                >
                  <Text style={styles.acceptButtonText}>Aceptar y registrar    </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
  
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
  form: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 50,
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
    backgroundColor: 'transparent', 
  },

  eyeIcon: {
    padding: 8, 
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '10%',
    marginTop: '10%',
  },
  termsText: {
    color: '#FF4500',
    marginLeft: 8,
    fontSize: 14,
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
  backButton: {
    marginBottom: 10,
  },
  checkboxContainer:{
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  checkboxText: {
    marginLeft: 5,
  }, 
});

export default SignUpScreen;
