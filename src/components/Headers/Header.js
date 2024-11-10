import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 

const Header = () =>  {

  const navigation = useNavigation(); 
 
  return (
    <>
        <View style={styles.iconsContainer}>
            <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={30} />
            </TouchableOpacity>
        </View>
    </>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
},
backIcon: {
    position: 'static',
    left: 10,
    marginBottom: '5%',
},
});

export default Header;