import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { useEffect, useState } from 'react';
import Login from '@/components/Login';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import PTest from "@/components/PTest";
import Chat from "@/components/Chat";
import Ionicons from '@expo/vector-icons/Ionicons';
import {Logo2} from "@/Images";

export default function App() {

  const Stack = createNativeStackNavigator();
  const Drawer = createDrawerNavigator();
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, (user)=> {
      // console.log('User',user);
      setUser(user);
    })
  })

  function CustomDrawerComponent(props){
    return (
      <View style={{flex: 1}}>
      <DrawerContentScrollView {...props} contentContainerStyle={{backgroundColor: '#dde3fe', paddingTop: 0, paddingStart: 0, paddingBottom: 0, paddingEnd: 0}}>
        <View style={{padding: 30}}>
          <Image style={{width: 120, height: 120, borderRadius: 60}} source={Logo2}></Image>
          <Text style={{fontWeight: 500, fontSize: 20, paddingTop: 20, color: '#5363df'}}>{user?.email}</Text>
        </View>
        <View style={{backgroundColor: "#fff", padding: 10}}>
        <DrawerItemList {...props} />
        </View>
        
      </DrawerContentScrollView>
      <View style={{borderTopColor: "#dde3fe", borderTopWidth: 1, padding: 10, paddingBottom: 30, flexDirection: 'row', alignItems:'center'}}>
        <DrawerItem label="Logout" onPress={() => FIREBASE_AUTH.signOut()} style={{backgroundColor: 'white', width: 310}} labelStyle={{fontSize: 16, fontWeight: 100}} icon={({ focused, color, size }) => <Ionicons color={color} size={size} name={focused ? 'log-out' : 'log-out-outline'} />}/>
      </View>
      </View>
    )
  }

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
      </Drawer.Navigator>
    )
  }

  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator>
          {user ?(<Stack.Screen name="Inside" component={InsideLayout} options={{ headerShown: false }}/>)
           : (<Stack.Screen name="Login" component={Login} options={{ headerShown: false }}/>)}
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
}

