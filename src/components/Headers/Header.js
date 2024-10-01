import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native'; 

const Header = () =>  {
  const navigation = useNavigation(); 

  return (
    <View className="flex-1 bg-[#F2F2F2] pt-[5%] px-[5%]">
      <View className="static mt-[5%] mb-[5%]">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={30} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
