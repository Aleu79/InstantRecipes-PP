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
import AsyncStorage from '@react-native-async-storage/async-storage';


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
  
      // Obtener el token y guardarlo en AsyncStorage
      const token = await user.getIdToken();
      console.log("El token es: ", token);
      await AsyncStorage.setItem('userToken', token);  
  
      setUser({ email: user.email, username, phone, token });  
  
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
              <Text style={styles.termsText}>Información del Proyecto</Text>
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

      <Text style={styles.modalTitle}>Sobre este Proyecto</Text>
      <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>
        **Última actualización:** 12 de diciembre de 2024
      </Text>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.modalText}>
          Este proyecto fue desarrollado como parte de nuestras prácticas profesionalizantes para{' '}
          <Text style={{ fontWeight: 'bold' }}> Calipso S.A.</Text>
        </Text>

        <Text style={styles.modalText}>
          La aplicación tiene como objetivo facilitar la organización y gestión de recetas culinarias, 
          permitiendo a los usuarios explorar distintas categorías, guardar sus recetas favoritas y personalizar su experiencia.
        </Text>

        <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>
          Objetivo:
        </Text>
        <Text style={styles.modalText}>
          Aprender y aplicar tecnologías modernas para resolver problemas reales, contribuyendo al entorno profesional 
          y adquiriendo experiencia significativa en desarrollo de software.
        </Text>

        <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>
          Aprendizajes Clave:
        </Text>
        <Text style={styles.modalText}>
          - En mi caso,{' '}
          <Text style={{ fontWeight: 'bold' }}> Damian Aguero</Text>, este proyecto me permitió profundizar completamente 
          en <Text style={{ fontWeight: 'bold' }}>JavaScript</Text> y <Text style={{ fontWeight: 'bold' }}>React</Text>, 
          entendiendo cómo integrar servicios externos y trabajar con componentes reutilizables.
        </Text>

        <Text style={styles.modalText}>
          - En el caso de{' '}
          <Text style={{ fontWeight: 'bold' }}> Rocio</Text>, su enfoque fue en aprender 
          <Text style={{ fontWeight: 'bold' }}> React Native</Text>, ganando habilidades para desarrollar aplicaciones 
          móviles multiplataforma con interfaces intuitivas y funcionales.
        </Text>

        <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>
          Desafíos y Logros:
        </Text>
        <Text style={styles.modalText}>
          A lo largo del proyecto, enfrentamos retos como la integración con Firebase, la gestión de estados complejos, 
          y la creación de una navegación fluida entre las distintas pantallas. Estos retos nos ayudaron a consolidar 
          nuestras habilidades y a aprender nuevas estrategias para la resolución de problemas.
        </Text>

        <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>
          Agradecimientos:
        </Text>
        <Text style={styles.modalText}>
          Queremos expresar nuestro agradecimiento a <Text style={{ fontWeight: 'bold' }}>Calipso S.A</Text> 
          {"\n"}por brindarnos esta oportunidad . Este proyecto marcó un 
          antes y un después en nuestra formación profesional y personal.
        </Text>
        <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>
          Lo que falta por completar:
        </Text>
        <Text style={styles.modalText}>
          Aunque el proyecto está bastante avanzado, aún hay varias áreas que requieren pulir. Una de ellas es el buscador, 
          que actualmente permite buscar pero no tiene una pantalla de detalle donde el usuario pueda ver la receta o el ingrediente 
          seleccionado. Esto debería implementarse para que la experiencia sea más fluida y funcional. 
        </Text>

        <Text style={styles.modalText}>
          Además, falta incorporar un filtro por ingredientes, que permita al usuario buscar recetas basadas en los ingredientes que tiene disponibles.
          Esto ayudaría a personalizar aún más la experiencia y hacerlo más útil para los usuarios.
        </Text>

        <Text style={styles.modalText}>
          En la sección de "Recetas Guardadas", hemos detectado un problema con el "bookmark". Cuando eliminas una receta de la sección de guardados, 
          desaparece correctamente, pero si vuelves a la receta en el Home, sigue marcándola como guardada (en amarillo). Esto requiere una revisión 
          para que los estados entre las distintas pantallas estén completamente sincronizados y reflejen los cambios correctamente.
        </Text>

        <Text style={[styles.modalText, { fontWeight: 'bold', marginTop: 10 }]}>
          Reflexión y cambios a futuro:
        </Text>
        <Text style={styles.modalText}>
          A lo largo de este proyecto, tanto Rocio Gutiérrez como yo, <Text style={{ fontWeight: 'bold' }}>Damian Aguero</Text>, 
          aprendimos muchísimo, no solo sobre las tecnologías involucradas, sino también sobre el proceso de desarrollo de software en equipo. 
          La experiencia fue enriquecedora y nos permitió aplicar conocimientos en situaciones reales. Sin embargo, hoy en día, 
          cambiaría algunas cosas del proyecto, sobre todo en términos de arquitectura.
        </Text>

        <Text style={styles.modalText}>
          A medida que el proyecto fue creciendo, empezamos a notar que la arquitectura actual ya no era la más eficiente para manejar 
          la complejidad y la escala del código. Si tuviera que rehacerlo, probablemente dividiría la aplicación en más módulos y 
          servicios, y utilizaría una arquitectura basada en patrones como MVC (Modelo-Vista-Controlador) o Redux para manejar el 
          estado de forma más predecible. Esto también facilitaría la escalabilidad y el mantenimiento del proyecto a largo plazo.
        </Text>

        <Text style={styles.modalText}>
          Además, la integración de nuevas funcionalidades como el filtrado por ingredientes y la visualización de recetas en una nueva 
          pantalla requiere un enfoque más modular, y la separación de responsabilidades dentro del código es clave para evitar que 
          se vuelva difícil de manejar conforme el proyecto siga creciendo.
        </Text>

        <Text style={styles.modalText}>
          Bueno, todo esto lo sé hoy en día gracias a la complicación que tuvimos a lo largo del proyecto, especialmente por la forma en 
          que fuimos aprendiendo a medida que íbamos haciendo la aplicación. Los desafíos y los problemas que enfrentamos nos han dado una 
          comprensión mucho más profunda de lo que implica desarrollar una aplicación completa y escalable. Por lo tanto, estoy muy conforme 
          con lo aprendido, y aunque hoy cambiaría algunas decisiones, estoy orgulloso del crecimiento que tuvimos tanto Rocio como yo.
        </Text>
      </ScrollView>
      <TouchableOpacity
        style={[styles.termsCheckbox]}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <Icon
          name={termsAccepted ? 'checkbox-outline' : 'square-outline'}
          size={24}
          color="#FF4500"
        />
        <Text style={styles.checkboxText}>He leído y entendido la información sobre este proyecto</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.acceptButton,
          !termsAccepted ? { backgroundColor: 'gray' } : {},
        ]}
        disabled={!termsAccepted}
        onPress={handleAcceptTerms}
      >
        <Text >Aceptar y continuar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',  
  },
  modalView: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    elevation: 10,  
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    paddingTop:20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',  
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#555',  
    marginBottom: 10,
  },
  scrollContainer: {
    maxHeight: 400,
    marginBottom: 20,  
  },
  acceptButton: {
    backgroundColor: '#FF4500',
    borderRadius: 25,
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 25,
    borderWidth: 1, 
    borderColor: '#FF4500',
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
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxText: {
    color: '#333',  
    fontSize: 14,
    marginLeft: 8,
  },
});

export default SignUpScreen;
