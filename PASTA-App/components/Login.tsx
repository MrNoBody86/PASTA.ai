import { FIREBASE_AUTH } from '@/FirebaseConfig';
import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Button, Pressable, KeyboardAvoidingView, Image } from 'react-native'
import { signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Logo2 } from '@/Images';


const Login = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);
        try {
            const response = await signInWithEmailAndPassword(auth,email, password);
            console.log(response);
        } catch (error:any) {
            alert(error.message);
            console.log(error);
        }finally {
            setLoading(false);
        }
    }

    const signUp = async () => {
        setLoading(true);
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            console.log(response)
        } catch (error:any) {
            alert(error.message);
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.loginContainer}>
            <KeyboardAvoidingView behavior='padding'>
                <Image style={styles.image} source={Logo2}/>
                <Text style={{fontSize: 20, marginBottom: 20, margin: 'auto'}}>Welcome to PASTA.ai</Text>
                <TextInput value={name} style={styles.input} placeholder='Full Name' autoCapitalize='none' onChangeText={(text) => setName(text)}></TextInput>
                <TextInput value={email} style={styles.input} placeholder='Email' autoCapitalize='none' onChangeText={(text) => setEmail(text)}></TextInput>
                <TextInput secureTextEntry={true} value={password} style={styles.input} placeholder='Password' autoCapitalize='none' onChangeText={(text) => setPassword(text)}></TextInput>
                {loading ? (<ActivityIndicator size='large' color='#0000ff' />
                ) : (
                <View style={styles.inline}>
                    <Pressable style={styles.button} onPress={signIn}><Text style={styles.buttonText}>Login</Text></Pressable>
                    <Pressable style={styles.button} onPress={signUp}><Text style={styles.buttonText}>Sign Up</Text></Pressable>
                </View>)}
            </KeyboardAvoidingView>
            </View>
        </View>
    );
};

export default Login;
 
const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    loginContainer:{
        backgroundColor: 'white',
        padding: 50,
        borderRadius: 20,
    },
    inline: {
        flexDirection: 'row'
    },
    image: {
        height: 100,
        width: 100,
        position: 'relative',
        margin: 'auto',
        marginTop: -100,
        borderRadius: 30,
        marginBottom: 25,
    },
    input: {
        marginVertical: 10,
        height: 50,
        minWidth: 250,
        borderWidth: 1,
        borderRadius: 4,
        padding: 10,
        backgroundColor: '#fff'  
    },
    button: {
        backgroundColor: '#004643',
        color: '#fff',
        padding: 10,
        justifyContent: 'center',
        flexDirection: 'column',
        margin: 'auto',
        marginTop: 15,
        borderRadius: 5,
        fontFamily: 'sans-serif',
        minWidth: 100,
        position: 'relative',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
    }
})