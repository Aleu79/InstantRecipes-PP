// UserProfile.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener este paquete instalado

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false); // Estado para alternar entre las dos vistas

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Icon name="person-circle-outline" size={100} color="#333" />
        <Text style={styles.username}>User_203754</Text>

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
        // Sección de edición de contacto
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
        // Sección de cambio de nombre y contraseña
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
    color: '#FFA500', // Cambia el color del texto al seleccionar
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
    backgroundColor: '#388E3C', // Verde más oscuro
    borderRadius: 40,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#8B0000', // Rojo más oscuro
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
