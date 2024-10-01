import React, { useContext, useRef } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity, Image, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { UserContext } from '../context/UserContext';
import Header from '../components/Headers/Header';

const SearchScreen = ({ navigation }) => {
  const categoriesScrollRef = useRef();
  const { user } = useContext(UserContext);

  // URLs de las imágenes para las categorías
  const categoryImages = [
    { url: 'https://images.themodernproper.com/billowy-turkey/production/posts/VegetableStirFry_9.jpg?w=600&q=82&auto=format&fit=crop&dm=1703377301&s=da9a5f34539f904ba0ad0f334d38db2f', category: 'Veggie' },
    { url: 'https://comerbeber.com/archivos/styles/xlarge/public/imagen/2022/02/carne-con-chimichurri-cv_1200.jpg', category: 'Carnes' },
    { url: 'https://i0.wp.com/chasety.com/wp-content/uploads/2023/09/realchasecurtis_Blackberry_Thyme_Lemonade_sitting_on_plate_on_288e693e-1655-44ae-9156-902a25fce640.png?w=816&ssl=1', category: 'Bebidas' },
    { url: 'https://i0.wp.com/www.pardonyourfrench.com/wp-content/uploads/2019/01/Classic-French-Croissant-Recipe-75.jpg?fit=1170%2C1755&ssl=1', category: 'Panadería' },
    { url: 'https://driscolls.imgix.net/-/media/assets/recipes/mixed-berry-tart.ashx?w=926&h=695&fit=crop&crop=entropy&q=50&auto=format,compress&cs=srgb&ixlib=imgixjs-3.4.2', category: 'Postres' },
    { url: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjyJ2LWwGUTPLR0pFNvc0ZwaxOw_hojR5GV5d0K0pBI4XEVYgpYfL679Hy4zkwPXIRA8H9Ni_gqpN1EVtlkWqwis0291bEv6UWsxRstb46IkYpEJC7lpNyOwDCM517gRpxHNwqTHP8LXCIg/w512-h640/Coquitos+Nestl%25C3%25A9+III.jpg', category: 'Sin TACC' }
  ];

  return (
    <View className="flex-1 bg-[#fafafa] pt-12 px-4">
      <Header />
      <View className="mb-5">
        <View>
          <Text className="text-[#888] text-sm">
            Hola, <Text className="font-bold">{user ? user.username || 'Usuario' : 'Invitado'}!</Text>
          </Text>
          <Text className="text-[#FF4500] text-2xl font-bold">Busca tus recetas favoritas!</Text>
        </View>
      </View>
      <View>
        <TextInput
          placeholder="Buscar"
          className="bg-[#f1f1f1] rounded-full text-lg p-4 h-12 pl-8"
        />
      </View>

      {/* Categorías */}
      <View className="flex-row flex-wrap mb-5 px-4 mt-3 w-full">
        <ScrollView
          ref={categoriesScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row"
        >
          {/* Botones de categorías */}
          {categoryImages.map((item, index) => (
            <View key={index} className="items-center mr-3 mb-3">
              <TouchableOpacity
                className="w-20 h-20 rounded-full justify-center items-center bg-[#FFA500]"
                onPress={() => navigation.navigate(item.category)}
              >
                <Image source={{ uri: item.url }} className="w-full h-full rounded-full" resizeMode="cover" />
              </TouchableOpacity>
              <Text className="mt-1 text-sm text-[#333] text-center">{item.category}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default SearchScreen;
