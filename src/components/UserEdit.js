import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth } from '../../firebase/firebase-config';
import { useNavigation } from '@react-navigation/native';

const UserEdit = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation();

  const handleSaveChanges = () => {
    // Aquí puedes agregar la lógica para guardar los cambios en el perfil del usuario
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
    } else {
      // Lógica para guardar los cambios
      Alert.alert('Éxito', 'Perfil actualizado');
      navigation.navigate('UserProfile');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Cambiar nombre de usuario</Text>
      <TextInput
        placeholder="Nuevo nombre de usuario"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />
      <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
      <TextInput
        placeholder="Nueva contraseña"
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        placeholder="Repetir nueva contraseña"
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Guardar cambios</Text>
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
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
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
});

export default UserEdit;
