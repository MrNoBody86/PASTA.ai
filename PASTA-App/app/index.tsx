import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Option from '../components/Option';
import { useEffect, useState } from 'react';
import { quizData } from '../questions';
import Results from '../components/Results';
import Login from '@/components/Login';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Header } from 'react-native/Libraries/NewAppScreen';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import PTest from "@/components/PTest";

export default function App() {

  const Stack = createNativeStackNavigator();
  const InsideStack = createNativeStackNavigator();
  const [user, setUser] = useState<User | null>(null);
  

  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user)=> {
      console.log('User',user);
      setUser(user);
    })
  })

  function InsideLayout() {
    return (
      <InsideStack.Navigator>
        <InsideStack.Screen name="Personality Test" component={PTest}/>
      </InsideStack.Navigator>
    )
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          {user ? (<Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }}/>)
           : (<Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>)}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

