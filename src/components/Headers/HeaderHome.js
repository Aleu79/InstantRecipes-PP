import React, { useState } from 'react';
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SideMenu from '../SideMenu'; 
import { useNavigation } from '@react-navigation/native'; 

const Header = () =>  {

  const navigation = useNavigation(); 
  const [menuVisible, setMenuVisible] = useState(false);
  const [image, setImage] = useState(null);

  return (
    <>
        <View style={styles.navbar}>
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                    <Icon name="person-circle-outline" size={50} color="#333" />
                )}
            </TouchableOpacity>
        </View>
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    paddingTop: 50,
    paddingHorizontal: 16,
},
backIcon: {
    position: 'static',
    top: 10,
    left: 10,
    marginBottom: '5%',
    marginTop: '5%',
},
navbar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingBottom: 8,
},
});

export default Header;