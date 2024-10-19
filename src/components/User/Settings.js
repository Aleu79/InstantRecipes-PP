import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../Headers/Header';
import BottomNavBar from '../BottomNavbar';
import { useNavigation } from '@react-navigation/native';

const Settings = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Header/>

        <View style={styles.separator} />

        <Text style={styles.Text}>Ajustes</Text>


        <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Terminos')}>
                <Icon name="document-text-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Términos y Condiciones</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedRecipes')}>
                <Icon name="desktop-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Desarrolladores</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('SavedRecipes')}>
                <Icon name="sunny-outline" size={24} color="#333" />
                <Text style={styles.menuText}>Tema</Text>
            </TouchableOpacity> */}
      </View>

      <BottomNavBar navigation={navigation} />

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fafafa',
    padding: 20,
  },
  menuContainer: {
    marginVertical: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuText: {
    marginLeft: 10,
    fontSize: 18,
  },
  Text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 10,
  }, 
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
});

export default Settings;
