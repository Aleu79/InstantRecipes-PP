import React, { useEffect } from 'react'
import { Image, StatusBar, StyleSheet, Text, View } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {

    const ring1padding = useSharedValue(0);
    const ring2padding = useSharedValue(0);
    const navigation = useNavigation()
    useEffect(()=>{
        ring1padding.value=0;
        ring1padding.value=0;
        setTimeout(()=>ring1padding.value =withSpring(ring1padding.value+hp(5)),100)
        setTimeout(() => ring2padding.value = withSpring(ring1padding.value + hp(5.5)), 300)

        setTimeout(()=>navigation.navigate('HomeScreen'),1500)

    },[])

  return (
    <View style={styles.Container}>
          <StatusBar barStyle={'light-content'} backgroundColor={"#ff8c1a"}/>

          <Animated.View style={[styles.Circle1,{padding:ring2padding}]}>
            <Animated.View style={[styles.Circle,{padding:ring1padding}]}>
                <Image source={require('../../assets/logoappsinfondo.png')}
                style={styles.ImageLogo}
                resizeMode='contain'
                />

            </Animated.View>
          </Animated.View>
          <View style={styles.textContainer}>
            <Text style={styles.text}>
                Instant Recipes
            </Text>
            <Text style={[styles.text,{fontSize:hp(2)}]}>
                Cocinar es el mejor ingrediente para la felicidad
            </Text>
          </View>
    </View>
  )
}

export default WelcomeScreen

const styles = StyleSheet.create({
    Container:{
        flex:1,
        alignItems:'center',
        justifyContent:"center",
        paddingVertical:10,
        backgroundColor: "#ff8c1a"

    },
    Circle:{
        
        borderRadius:235,
        alignItems:'center',
        justifyContent:"center",
        backgroundColor:"#ff944d",

    },
    Circle1: {
        
        borderRadius:220,
        alignItems: 'center',
        justifyContent: "center",
        backgroundColor:"#ff751a",

    },
    ImageLogo:{
        width:hp(20),
        height:hp(20)
    },
    textContainer:{
        alignItems:"center",
        marginVertical:20
    },
    text:{
        fontWeight:"bold",
        fontSize:hp(4),
        color:"#FFF",
        textAlign: 'center',
    }
})