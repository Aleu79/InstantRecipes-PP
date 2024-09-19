import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [image, setImage] = useState(null);
  const { user } = useContext(UserContext);

  // Función para abrir la galería y seleccionar una imagen
  const pickImage = async () => {
    // Solicitar permisos para la galería
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (mediaLibraryStatus !== 'granted') {
      alert('Lo sentimos, necesitamos permisos para acceder a la galería.');
      return;
    }

    // Solicitar permisos para la cámara (opcional)
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraStatus !== 'granted') {
      alert('Lo sentimos, necesitamos permisos para acceder a la cámara.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.uri);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle-outline" size={100} color="#333" />
          )}
        </TouchableOpacity>
        <Text style={styles.username}>{user ? user.username : 'Invitado'}</Text>
        <View style={styles.editSection}>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.editTextContainer}>
            <Text style={[styles.editText, !isEditing && styles.activeText]}>Editar perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(true)}>
            <Icon name="settings" size={24} color={isEditing ? "#FFA500" : "#333"} />
          </TouchableOpacity>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Cambiar e-mail de contacto</Text>
          <TextInput
            placeholder="Cambiar e-mail de contacto"
            style={styles.input}
          />
          <Text style={styles.sectionTitle}>Cambiar celular de contacto</Text>
          <TextInput
            placeholder="Cambiar celular de contacto"
            style={styles.input}
          />
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Cambiar nombre de usuario</Text>
          <TextInput
            placeholder="Cambiar nombre de usuario"
            style={styles.input}
          />
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
          <TextInput
            placeholder="Nueva contraseña"
            style={styles.input}
            secureTextEntry
          />
          <TextInput
            placeholder="Repetir nueva contraseña"
            style={styles.input}
            secureTextEntry
          />
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Eliminar perfil</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#333',
  },
  username: {
    fontSize: 22,
    marginVertical: 10,
    color: '#333',
  },
  editSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editTextContainer: {
    marginRight: 10,
  },
  editText: {
    fontSize: 18,
    color: '#333',
  },
  activeText: {
    color: '#FFA500',
  },
  settingsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 40,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  saveButton: {
    backgroundColor: '#388E3C',
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#8B0000',
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default UserProfile;
