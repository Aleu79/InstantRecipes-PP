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
          <Icon name="chevron-back" size={30} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editIcon} onPress={() => navigation.navigate('UserEdit')}>
          <Icon name="pencil" size={26} color="#333" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingTop: 50,
    paddingHorizontal: 16,
},
iconsContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: '5%',
  marginTop: '5%',
  position: 'static',
},
backIcon: {
    position: 'static',
    top: 10,
    left: 10,
    marginBottom: '5%',
},
editIcon: {
  position: 'static',
  top: 10,
  right: 10,
  marginBottom: '5%',
},

});

export default Header;