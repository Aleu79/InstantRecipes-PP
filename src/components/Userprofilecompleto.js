// import React, { useState, useContext, useEffect } from 'react';
// import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { UserContext } from '../context/UserContext';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { storage } from '../../firebase/firebase-config';
// import { auth } from '../../firebase/firebase-config';
// import { Alert } from 'react-native';
// import { useNavigation } from '@react-navigation/native';

// const UserProfile = () => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [image, setImage] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const { user } = useContext(UserContext);
//   const navigation = useNavigation();

//   // Función para abrir la galería y seleccionar una imagen
//   const pickImage = async () => {
//     // Solicitar permisos para la galería
//     const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (mediaLibraryStatus !== 'granted') {
//       console.log('Permiso de galería no concedido:', mediaLibraryStatus);
//       alert('Lo sentimos, necesitamos permisos para acceder a la galería.');
//       return;
//     }

//     const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
//     if (cameraStatus !== 'granted') {
//       console.log('Permiso de cámara no concedido:', cameraStatus);
//       alert('Lo sentimos, necesitamos permisos para acceder a la cámara.');
//       return;
//     }

//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     console.log('Resultado de la selección de imagen:', result);

//     if (result.assets && result.assets.length > 0) {
//       const selectedImage = result.assets[0];
//       console.log('URI de la imagen seleccionada:', selectedImage.uri);

//       // Subir la imagen a Firebase Storage
//       const response = await fetch(selectedImage.uri);
//       const blob = await response.blob();

//       const filename = selectedImage.uri.substring(selectedImage.uri.lastIndexOf('/') + 1);
//       const imageRef = ref(storage, profileImages/${filename});

//       setUploading(true);

//       try {
//         await uploadBytes(imageRef, blob);
//         const url = await getDownloadURL(imageRef);
//         console.log('URL de la imagen subida:', url);
//         setImage(url); // Actualiza el estado con la URL de la imagen subida
//       } catch (error) {
//         console.error('Error al subir la imagen:', error);
//       } finally {
//         setUploading(false);
//       }
//     }
//   };
//   const handleDeleteProfile = async () => {
//     try {
//       const user = auth.currentUser;
//       if (user) {
//         console.log('Usuario autenticado:', user);
//         await user.delete();
//         Alert.alert('Éxito', 'Perfil eliminado con éxito')
//         navigation.navigate('Login'); 
//         //agregar código para limpiar el contexto de usuario y otros datos relacionados
//       } else {
//         Alert.alert('Error', 'No hay usuario autenticado');
//       }
//     } catch (error) {
//       console.error('Error al eliminar perfil:', error);
//       Alert.alert('Error', error.message);
//     }
//   };
//   useEffect(() => {
//     console.log('Estado de la imagen al renderizar:', image);
//   }, [image]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.profileContainer}>
//         <TouchableOpacity onPress={pickImage}>
//           {image ? (
//             <Image source={{ uri: image }} style={styles.profileImage} />
//           ) : (
//             <Icon name="person-circle-outline" size={100} color="#333" />
//           )}
//         </TouchableOpacity>
//         <Text style={styles.username}>{user ? user.username : 'Invitado'}</Text>
//         <View style={styles.editSection}>
//           <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.editTextContainer}>
//             <Text style={[styles.editText, !isEditing && styles.activeText]}>Editar perfil</Text>
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => setIsEditing(true)}>
//             <Icon name="settings" size={24} color={isEditing ? "#FFA500" : "#333"} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {isEditing ? (
//         <View style={styles.settingsContainer}>
//           <Text style={styles.sectionTitle}>Cambiar e-mail de contacto</Text>
//           <TextInput
//             placeholder="Cambiar e-mail de contacto"
//             style={styles.input}
//           />
//           <Text style={styles.sectionTitle}>Cambiar celular de contacto</Text>
//           <TextInput
//             placeholder="Cambiar celular de contacto"
//             style={styles.input}
//           />
//           <TouchableOpacity style={styles.saveButton}>
//             <Text style={styles.saveButtonText}>Guardar</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.settingsContainer}>
//           <Text style={styles.sectionTitle}>Cambiar nombre de usuario</Text>
//           <TextInput
//             placeholder="Cambiar nombre de usuario"
//             style={styles.input}
//           />
//           <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
//           <TextInput
//             placeholder="Nueva contraseña"
//             style={styles.input}
//             secureTextEntry
//           />
//           <TextInput
//             placeholder="Repetir nueva contraseña"
//             style={styles.input}
//             secureTextEntry
//           />
//           <TouchableOpacity style={styles.saveButton}>
//             <Text style={styles.saveButtonText}>Guardar</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProfile}>
//         <Text style={styles.deleteButtonText}>Eliminar perfil</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#E5E5E5',
//     paddingTop: 50,
//     paddingHorizontal: 20,
//   },
//   profileContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   profileImage: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 1,
//     borderColor: '#333',
//   },
//   username: {
//     fontSize: 22,
//     marginVertical: 10,
//     color: '#333',
//   },
//   editSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   editTextContainer: {
//     marginRight: 10,
//   },
//   editText: {
//     fontSize: 18,
//     color: '#333',
//   },
//   activeText: {
//     color: '#FFA500',
//   },
//   settingsContainer: {
//     marginTop: 20,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     marginBottom: 5,
//     color: '#333',
//     fontWeight: 'bold',
//   },
//   input: {
//     backgroundColor: '#FFF',
//     borderRadius: 40,
//     padding: 12,
//     marginBottom: 15,
//     borderWidth: 1,
//     borderColor: '#CCC',
//   },
//   saveButton: {
//     backgroundColor: '#388E3C',
//     borderRadius: 40,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//   },
//   deleteButton: {
//     backgroundColor: '#8B0000',
//     borderRadius: 40,
//     paddingVertical: 12,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   deleteButtonText: {
//     color: '#FFF',
//     fontSize: 16,
//   },
// });

// export default UserProfile;