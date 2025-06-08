// src/pages/Login.tsx
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import React, { useState, useEffect } from 'react'; // Import useEffect
import { View, Text, StyleSheet, TextInput, ActivityIndicator, Pressable, KeyboardAvoidingView, Image, ImageBackground } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Keep this for email/password login
import { Logo2, backgroundImage } from '@/Images';

import Modal from "react-native-modal";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationProp } from '@react-navigation/native';

// --- NEW IMPORTS FOR GOOGLE SIGN-IN ---
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
// ------------------------------------

// IMPORTANT: Add this line at the top level of your component or App.tsx
// It's good practice to have this outside your component function.
WebBrowser.maybeCompleteAuthSession();

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

// Replace with your actual Web client ID from Firebase Console
// It should look something like "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com"
const WEB_CLIENT_ID = '503761265112-dv2gn8jc24n91em5bomh4qr51tv9uqua.apps.googleusercontent.com'; // <--- *** REPLACE THIS WITH YOUR COPIED ID! ***

// Login component for handling user authentication
const Login = ({ navigation }: RouterProps) => {
    // State variables for managing user inputs and status
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [signInError, setSignInError] = useState(false);
    // const [signUpError, setSignUpError] = useState(false); // signUpError doesn't seem to be used here
    const auth = FIREBASE_AUTH; // Firebase authentication instance

    // --- NEW: Google authentication request hook ---
    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: WEB_CLIENT_ID,
        // You can add more scopes if needed, e.g., ['profile', 'email']
    });
    // ------------------------------------------------

    // --- NEW: useEffect to handle Google sign-in response ---
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.authentication;
            if (id_token) {
                // Build Firebase credential with the Google ID token.
                const credential = GoogleAuthProvider.credential(id_token);

                setLoading(true); // Show loading for Firebase sign-in
                // Sign in with credential from the Google user.
                FIREBASE_AUTH.signInWithCredential(credential)
                    .then((userCredential) => {
                        // Signed in successfully
                        const user = userCredential.user;
                        console.log("Google Sign-In successful:", user.email);
                        // The onAuthStateChanged listener in App.tsx will handle
                        // automatically navigating to InsideLayout once the user is signed in.
                    })
                    .catch((error) => {
                        console.error("Firebase Google Sign-In Error:", error.message);
                        // alert("Google Sign-In Failed: " + error.message); // You can use your existing Modal or an alert
                        setSignInError(true); // Using your existing signInError modal for Google errors too
                    })
                    .finally(() => {
                        setLoading(false); // Hide loading indicator
                    });
            } else {
                console.error("No ID token found in Google response.");
                setSignInError(true); // Indicate an error
            }
        } else if (response?.type === 'error') {
            console.error("Google Auth Request Error:", response.error);
            setSignInError(true); // Indicate an error
        }
    }, [response]); // Only re-run if 'response' changes
    // --------------------------------------------------------


    // Function to handle user sign-in (email/password)
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

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container} edges={['left', 'right']}>
                <ImageBackground source={backgroundImage} style={styles.backgroundImage}> {/* Apply backgroundImage style here */}
                    <View style={styles.container}>
                        <View style={styles.loginContainer}>
                            <KeyboardAvoidingView behavior='padding'>
                                {/* App logo */}
                                <Image style={styles.image} source={Logo2} />
                                <Text style={{ fontSize: 18, marginBottom: 10, margin: 'auto', textAlign: 'center' }}>
                                    Welcome back to
                                </Text>
                                <Text style={{ fontSize: 21, marginBottom: 20, margin: 'auto', textAlign: 'center' }}>
                                    PASTA.ai
                                </Text>

                                {/* Input fields for user email and password */}
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

                                {/* Buttons for login and sign-up */}
                                <View style={styles.inline}>
                                    <Pressable style={styles.button} onPress={signIn}>
                                        <Text style={styles.buttonText}>Login</Text>
                                    </Pressable>
                                </View>

                                {/* --- NEW: Google Sign-In Button --- */}
                                <View style={styles.inline}>
                                    <Pressable
                                        style={[styles.button, styles.googleButton]} // Apply a new style for distinct look
                                        disabled={!request} // Disable if the Google auth request is not ready
                                        onPress={() => {
                                            promptAsync(); // Start the Google authentication flow
                                        }}>
                                        <Text style={styles.buttonText}>Sign in with Google</Text>
                                    </Pressable>
                                </View>
                                {/* --------------------------------- */}

                                <View style={styles.inline}>
                                    <Text style={{ fontSize: 15, marginTop: 20, margin: 'auto' }}> Don't have an account ?</Text>
                                    <Pressable style={styles.signup} onPress={() => navigation.navigate('Signup')} >
                                        <Text style={styles.signupText}>Sign Up</Text>
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

export default Login;

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
        // backgroundImage: backgroundImage, // Remove this line from here as it's for ImageBackground component
    },
    backgroundImage: { // Add style for ImageBackground
        flex: 1,
        width: '100%',
        height: '100%',
        justifyContent: "center",
        alignItems: 'center',
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
    // --- NEW STYLE FOR GOOGLE BUTTON ---
    googleButton: {
        backgroundColor: '#DB4437', // Google's red color
        marginTop: 10, // Add some margin above it
    },
    // ------------------------------------
});