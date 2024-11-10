import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import UserProfile from './src/components/User/UserProfile';
import UserEdit from './src/components/User/UserEdit';
import { UserProvider, UserContext } from './src/context/UserContext';
import SearchScreen from './src/screens/SearchScreen';
import SavedRecipes from './src/screens/SavedRecipes';
import MyRecipes from './src/screens/MyRecipes';
import CategoryRecipesScreen from './src/screens/CategoryRecipesScreen';
import RecipeScreen from './src/screens/RecipeScreen';
import CreateRecipeScreen from './src/screens/CreateRecipeScreen';
import TerminosyCondiciones from './src/terminosydesarrolladores/Terminosycondiciones';
import FilterByIngredients from './src/screens/FilterByIngredients';
import Settings from './src/components/User/Settings';
import Notifications from './src/screens/Notifications';
import DevelopersScreen from './src/terminosydesarrolladores/Desarroladores';
import { ThemeProvider } from './src/context/ThemeContext'; 
import RecipeDetailsScreen from './src/screens/RecipeDetailsScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoadingScreen from './src/screens/LoadingScreen'; 
import { LanguageProvider } from './src/context/LanguajeContext';
import MyRecipeScreen from './src/screens/MyRecipeScreen';

const Stack = createStackNavigator();

function AppNavigation() {
  const { user } = useContext(UserContext); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true); 

  useEffect(() => {
    console.log("Valor de user en useEffect:", user);
    
    if (user) {
      setIsLoggedIn(true); 
    } else {
      setIsLoggedIn(false); 
    }
    
    setIsVerifying(false); 
    console.log("Estado de isLoggedIn en useEffect:", isLoggedIn);
  }, [user]);

  if (isVerifying) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator initialRouteName={isLoggedIn ? "Welcome" : "Login"}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Sign Up" component={SignUpScreen} options={{ headerShown: false }} />
        </>
      )}
      {/* Estas pantallas se pueden mostrar en ambos casos si se necesita */}
      <Stack.Screen name="UserProfile" component={UserProfile} options={{headerShown:false}} />
      <Stack.Screen name="MyRecipes" component={MyRecipes} options={{headerShown:false}} />
      <Stack.Screen name="SavedRecipes" component={SavedRecipes} options={{headerShown:false}} />
      <Stack.Screen name="UserEdit" component={UserEdit} options={{headerShown:false}} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} options={{headerShown:false}} />
      <Stack.Screen name="RecipeScreen" component={RecipeScreen} options={{headerShown:false}} />
      <Stack.Screen name="CategoryRecipesScreen" component={CategoryRecipesScreen} options={{headerShown:false}} />
      <Stack.Screen name="CreateRecipeScreen" component={CreateRecipeScreen} options={{headerShown:false}} />
      <Stack.Screen name="Terminos" component={TerminosyCondiciones} options={{headerShown:false}} />
      <Stack.Screen name="FilterByIngre" component={FilterByIngredients} options={{headerShown:false}} />
      <Stack.Screen name="Settings" component={Settings} options={{headerShown:false}} />
      <Stack.Screen name="Notifications" component={Notifications} options={{headerShown:false}} />
      <Stack.Screen name="DevelopersScreen" component={DevelopersScreen} options={{headerShown:false}} />
      <Stack.Screen name="RecipeDetailsScreen" component={RecipeDetailsScreen} options={{headerShown:false}}/>
      <Stack.Screen name="MyRecipeScreen" component={MyRecipeScreen} options={{headerShown:false}}/>
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NavigationContainer>
            <AppNavigation /> 
          </NavigationContainer>
        </LanguageProvider>  
      </ThemeProvider>
    </UserProvider>
  );
}
