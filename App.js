import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import UserProfile from './src/components/User/UserProfile';
import UserEdit from './src/components/User/UserEdit';
import { UserProvider } from './src/context/UserContext'; 
import SearchScreen  from './src/screens/SearchScreen';
import SavedRecipes  from './src/screens/SavedRecipes';
import MyRecipes  from './src/screens/MyRecipes';
import CategoryRecipesScreen from './src/screens/CategoryRecipesScreen';
import RecipeScreen from './src/screens/RecipeScreen';
import CreateRecipeScreen from './src/screens/CreateRecipeScreen';
import { AlertNotificationRoot } from 'react-native-alert-notification';

const Stack = createStackNavigator();

export default function App() {
  return (
    <UserProvider> 
      <AlertNotificationRoot>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Sign Up" component={SignUpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserProfile" component={UserProfile} options={{headerShown:false}} />
          <Stack.Screen name="MyRecipes" component={MyRecipes} options={{headerShown:false}} />
          <Stack.Screen name="SavedRecipes" component={SavedRecipes} options={{headerShown:false}} />
          <Stack.Screen name="UserEdit" component={UserEdit} options={{headerShown:false}} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} options={{headerShown:false}} />
          <Stack.Screen name="RecipeScreen" component={RecipeScreen} options={{headerShown:false}}/>
          <Stack.Screen name="CategoryRecipesScreen" component={CategoryRecipesScreen}  options={{headerShown:false}}  />
          <Stack.Screen name="CreateRecipeScreen" component={CreateRecipeScreen}  options={{headerShown:false}}  />
        </Stack.Navigator>
      </NavigationContainer>
      </AlertNotificationRoot>
    </UserProvider>
  );
}
