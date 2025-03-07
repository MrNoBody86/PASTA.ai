import { FIREBASE_AUTH } from '@/FirebaseConfig';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Pressable, KeyboardAvoidingView, Image, ImageBackground } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Logo2, backgroundImage } from '@/Images';
import Modal from "react-native-modal";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

// Login component for handling user authentication
const Signup = ({ navigation } : RouterProps) => {
    // State variables for managing user inputs and status
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [signInError, setSignInError] = useState(false);
    const [signUpError, setSignUpError] = useState(false);
    const auth = FIREBASE_AUTH; // Firebase authentication instance

    // Function to handle user sign-in
    const signIn = async () => {
        setLoading(true);
        try {
            // Attempt to sign in with email and password
            const response = await signInWithEmailAndPassword(auth, email, password);
            // console.log(response)
        } catch (error: any) {
            // Show error modal if sign-in fails
            setSignInError(true);
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    // Function to handle user sign-up
    const signUp = async () => {
        setLoading(true);
        try {
            // Attempt to sign up with email and password
            const response = await createUserWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            // Show error modal if sign-up fails
            setSignUpError(true);
            // console.log(error);
        } finally {
            setLoading(false); // Hide loading indicator
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <ImageBackground source={backgroundImage}>
                    <View style={styles.container}>
                        <View style={styles.loginContainer}>
                            <KeyboardAvoidingView behavior='padding'>
                                {/* App logo */}
                                <Image style={styles.image} source={Logo2} />
                                <Text style={{ fontSize: 16, marginBottom: 10, margin: 'auto', textAlign: 'center' }}>
                                    New to PASTA.ai do a quick
                                </Text>
                                <Text style={{ fontSize: 20, marginBottom: 20, margin: 'auto', textAlign: 'center' }}>
                                    Sign Up
                                </Text>
                                
                                {/* Input fields for user name, email, and password */}
                                <TextInput 
                                    value={email} 
                                    style={styles.input} 
                                    placeholder='Email' 
                                    autoCapitalize='none' 
                                    onChangeText={(text) => setEmail(text)} 
                                />
                                <TextInput 
                                    secureTextEntry={true} 
                                    value={password} 
                                    style={styles.input} 
                                    placeholder='Password' 
                                    autoCapitalize='none' 
                                    onChangeText={(text) => setPassword(text)} 
                                />

                                {/* Modal for loading indicator */}
                                <Modal isVisible={loading} style={styles.ModalStyle} animationInTiming={1} animationOutTiming={1}>
                                    <View style={styles.View}>
                                        <ActivityIndicator size="large" />
                                        <Text style={styles.text}>Loading</Text>
                                    </View>
                                </Modal>

                                {/* Modal for sign-in error */}
                                <Modal isVisible={signInError} style={styles.ModalStyle} animationInTiming={1} animationOutTiming={1}>
                                    <View style={styles.View}>
                                        <Text style={styles.ModalText}>Sign In Failed</Text>
                                        <Pressable style={styles.button} onPress={() => setSignInError(false)}>
                                            <Text style={styles.buttonText}>Close</Text>
                                        </Pressable>
                                    </View>
                                </Modal>

                                {/* Modal for sign-up error */}
                                <Modal isVisible={signUpError} style={styles.ModalStyle} animationInTiming={1} animationOutTiming={1}>
                                    <View style={styles.View}>
                                        <Text style={styles.ModalText}>Sign Up Failed</Text>
                                        <Pressable style={styles.button} onPress={() => setSignUpError(false)}>
                                            <Text style={styles.buttonText}>Close</Text>
                                        </Pressable>
                                    </View>
                                </Modal>

                                {/* Buttons for login and sign-up */}
                                <View style={styles.inline}>
                                    <Pressable style={styles.button} onPress={signUp}>
                                        <Text style={styles.buttonText}>Sign Up</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.inline}>
                                    <Text style={{ fontSize: 15, marginTop: 20, margin: 'auto' }}> Already have an account ?</Text>
                                    <Pressable style={styles.signup} onPress={() => navigation.navigate('Login')}>
                                        <Text style={styles.signupText}>Login</Text>
                                    </Pressable>
                                </View>
                            </KeyboardAvoidingView>
                        </View>
                    </View>
                </ImageBackground>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default Signup;

// Styles for the Login component
const styles = StyleSheet.create({
    View: {
        backgroundColor: "white",
        height: 140,
        width: 300,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        borderColor: "black",
        borderWidth: 2,
        position: 'relative',
    },
    text: {
        fontSize: 16,
        paddingTop: 10,
    },
    ModalText: {
        fontSize: 18,
        paddingTop: 20,
    },
    ModalStyle: {
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        marginHorizontal: 20,
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
        backgroundImage: backgroundImage,
    },
    loginContainer: {
        backgroundColor: 'white',
        padding: 50,
        borderRadius: 20,
    },
    inline: {
        flexDirection: 'row',
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
        backgroundColor: '#fff',
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
    },
    signup: {
        backgroundColor: 'white',
        color: "black",
        padding: 10,
        justifyContent: 'center',
        flexDirection: 'column',
        marginLeft: 0,
        marginTop: 10.5,
        borderRadius: 5,
        fontFamily: 'sans-serif',
        minWidth: 10,
        position: 'relative',
        alignItems: 'center',
    },
    signupText: {
        color: 'blue',
    },
});
