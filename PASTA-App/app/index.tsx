// Importing necessary components and libraries from React Native and other packages
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from 'react';
import Login from '@/src/pages/Login';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import PTest from "@/src/pages/PTest";
import Chat from "@/src/pages/Chat";
import Financial_Chat from '@/src/pages/Financial_ChatBot';
import Fitness_Chat from '@/src/pages/Fitness_ChatBot';
import Task_Manager from '@/src/pages/Task_Manager';
import Ionicons from '@expo/vector-icons/Ionicons';
import {Logo2} from "@/Images";
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import Signup from '@/src/pages/Signup';

// Main App component
export default function App() {
  // Creating stack and drawer navigators
  const Stack = createNativeStackNavigator();
  const Drawer = createDrawerNavigator();
  const LoginStack = createNativeStackNavigator();

  // State to manage the current authenticated user
  const [user, setUser] = useState<User | null>(null);
  
  // Effect to monitor authentication state changes
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user)=> {
      // Updating user state when authentication state changes
      setUser(user);
    })
  })

  // Custom drawer component to display user info and logout button
  function CustomDrawerComponent(props){
    return (
      <View style={{flex: 1}}>
      <DrawerContentScrollView {...props} contentContainerStyle={{backgroundColor: '#dde3fe', paddingTop: 0, paddingStart: 0, paddingBottom: 0, paddingEnd: 0}}>
        
        {/* Displaying user profile picture and email */}
        <View style={{padding: 30}}>
          <Image style={{width: 120, height: 120, borderRadius: 60}} source={Logo2}></Image>
          <Text style={{fontWeight: 500, fontSize: 20, paddingTop: 20, color: '#5363df'}}>{user?.email}</Text>
        </View>
        {/* Displaying list of drawer items */}
        <View style={{backgroundColor: "#fff", padding: 10}}>
        <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* Logout button at the bottom of the drawer */}
      <View style={{borderTopColor: "#dde3fe", borderTopWidth: 1, padding: 10, paddingBottom: 30, flexDirection: 'row', alignItems:'center'}}>
        <DrawerItem label="Logout" onPress={() => FIREBASE_AUTH.signOut()} style={{backgroundColor: 'white', width: 310}} labelStyle={{fontSize: 16, fontWeight: 100}} icon={({ focused, color, size }) => <Ionicons color={color} size={size} name={focused ? 'log-out' : 'log-out-outline'} />}/>
      </View>
      </View>
    )
  }
  function LoginLayout(){
    return(
      <LoginStack.Navigator>
        <LoginStack.Screen name="Login" component={Login} options={{headerShown:false}}/>
        <LoginStack.Screen name="Signup" component={Signup} options={{headerShown:false}}/>
      </LoginStack.Navigator>
    )
  }
  // Layout for screens accessible after login, using a drawer navigator
  function InsideLayout(){
    return (
      <Drawer.Navigator initialRouteName="Personality Test"
                        drawerContent={(props) => <CustomDrawerComponent {...props}/>}
                        screenOptions={{
                          drawerActiveTintColor: 'white',
                          drawerActiveBackgroundColor: '#003CB3',
                          drawerItemStyle: {borderRadius: 15, marginTop: 10},
                          drawerLabelStyle: {fontSize: 16}
                        }}>
          {/* Defining screens available in the drawer */}
          <Drawer.Screen
            name="Personality Test"
            component={PTest} 
            options={{drawerLabel: "Personality Test", 
                      headerTitle: "Take a Personality Test",
                      drawerIcon: ({size, color}) => (<Ionicons name="clipboard-outline" color={color} size={size} />)}}
            />
          <Drawer.Screen 
            name="Chat" 
            component={Chat} 
            options={{drawerLabel: "Chatbox",
                      headerTitle: "ChatBox", 
                      drawerIcon: ({size, color}) => (<Ionicons name="chatbox-outline" color={color} size={size} />)}}
          />
          <Drawer.Screen 
            name="Financial Chat" 
            component={Financial_Chat} 
            options={{drawerLabel: " Financial Chatbox",
                      headerTitle: "Financial ChatBox", 
                      drawerIcon: ({size, color}) => (<Ionicons name="chatbox-outline" color={color} size={size} />)}}
          />
          <Drawer.Screen 
            name="Fitness Chat" 
            component={Fitness_Chat} 
            options={{drawerLabel: " Fitness Chatbox",
                      headerTitle: "Fitness ChatBox", 
                      drawerIcon: ({size, color}) => (<Ionicons name="chatbox-outline" color={color} size={size} />)}}
          />
          <Drawer.Screen 
            name="Task Manager" 
            component={Task_Manager} 
            options={{drawerLabel: "Task Manager",
                      headerTitle: "Task Manager", 
                      drawerIcon: ({size, color}) => (<Ionicons name="clipboard-outline" color={color} size={size} />)}}
          />
      </Drawer.Navigator>
    )
  }
  // Main return block for rendering the app
  return (
    <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }}>
      <NavigationIndependentTree>
        <NavigationContainer>
          <Stack.Navigator>
            {user ? (
              <Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }} />
            ) : (
              <Stack.Screen name="LoginPage" component={LoginLayout} options={{ headerShown: false }} />
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </NavigationIndependentTree>
      <StatusBar backgroundColor="black" style="light" />
    </SafeAreaView>
  </SafeAreaProvider>
  
  );
}