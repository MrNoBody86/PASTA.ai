// Import necessary components and libraries from React Native, Firebase, and Axios
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from "../../components/ChatBubble";
import { speak, isSpeakingAsync, stop } from "expo-speech";
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, orderBy, getDocs, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { FINANCE_API_URL } from '@/constants';

// Financial_Chat component to manage the financial chatbot interface
export function Financial_Chat() {
    // Define state variables for chat messages, user input, loading status, error messages, and speech status
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Function to retrieve recent chat messages from Firebase Firestore
    async function getRecentFinancialChatbotMessages(db, userUid, messageLimit) {
        const messagesRef = collection(db, "users", userUid, "financeMessages");
        const q = query(
            messagesRef,
            orderBy("timestamp"),  // Order messages by timestamp in ascending order
            limit(messageLimit)     // Limit the number of messages retrieved
        );
        const querySnapshot = await getDocs(q);
        const messages = [];

        // Extract message data and format it for display
        querySnapshot.forEach((doc) => {
            // console.log("Document  => ", doc.data());
            const messageData = {
                parts: [{ text: doc.data().content }],
                role: doc.data().sender,
                // timestamp: doc.data().timestamp,
            }
           messages.push(messageData);
        });
        setChat(messages);  // Update chat state with retrieved messages
    }

    // useEffect hook to load chat history on component mount
    useEffect(() => {
        if(FIREBASE_AUTH.currentUser?.uid){
            getRecentFinancialChatbotMessages(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
        }
        // console.log("Stored Messages:",message);
    })
    // Function to add a new message to Firebase Firestore
    async function addMessage(db, userUid, sender, text) {
        try {
            const messagesRef = collection(db, "users", userUid, "financeMessages");
            const newMessage = {
                sender: sender,
                content: text,
                timestamp: serverTimestamp(),
            };
            const docRef = await addDoc(messagesRef, newMessage);  // Save message to Firestore
            console.log("Document written with ID: ", docRef.id);
            return docRef;  // Return reference to the new document
        } catch (e) {
            console.error("Error adding document: ", e);
            throw e;  // Rethrow error to be handled by caller
        }
    }

    // Function to handle user input and fetch chatbot response
    const handleUserInput = async () => {
        // Add user input to chat state
        let updatedChat = [
            ...chat,
            {
                role: 'user',
                parts: [{ text: userInput }],
            },
        ];
        setLoading(true);  // Show loading indicator

        try {
            // Send user input to financial API and await response
            const response = await axios.get(`${FINANCE_API_URL}/${userInput}`);
            console.log("Agent Response", response.data['response']);

            if (response.data) {
                // Add chatbot's response to chat state
                const updatedChatWithModel = [
                    ...updatedChat,
                    {
                        role: 'model',
                        parts: [{ text: response.data['response'] }],
                    },
                ];
                setChat(updatedChatWithModel);
                
                // Save both user and model messages to Firestore
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "user", userInput);
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "model", response.data['response']);
                
                setUserInput("");  // Clear user input field
                setError("");
            }

        } catch (error: any) {
            console.log("Error calling Gemini", error);
            console.log("Error response", error.response);
            setError("An Error occurred, Please try again");  // Display error message
        } finally {
            setLoading(false);  // Hide loading indicator
        }
    };

    // Function to handle text-to-speech for model messages
    const handleSpeech = async (text) => {
        if (isSpeaking) {
            stop();  // Stop ongoing speech
            setIsSpeaking(false);
        } else {
            if (!(await isSpeakingAsync())) {
                speak(text);  // Start speech for the provided text
                setIsSpeaking(true);
            }
        }
    };

    // Function to render individual chat items using ChatBubble component
    const renderChatItem = ({ item }) => {
        return (
            <ChatBubble
                role={item.role}
                text={item.parts[0].text}
                onSpeech={() => handleSpeech(item.parts[0].text)}  // Pass speech handler as prop
            />
        );
    };

    // Render the main UI for the Financial_Chat component
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Financial ChatBot</Text>
            <FlatList
                data={chat}
                renderItem={renderChatItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.chatContainer}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Type a message"
                />
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: userInput ? '#007AFF' : '#8bbff7' }]}
                    onPress={handleUserInput}
                    disabled={!userInput}
                >
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>} 
        </View>
    );
}

export default Financial_Chat;
const styles = StyleSheet.create({
    container:{
        flex: 1,
        padding: 16,
        backgroundColor: "#f8f8f8",
    },
     title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        color: '#333',
        marginTop: 40,
        textAlign: 'center'
     },
    chatContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    inputContainer:{
        flexDirection: 'row', 
        alignItems: 'center',
        marginTop: 10,
    },
    input:{
        flex: 1,
        height: 50,
        marginRight: 10,
        padding: 8,
        borderColor: '#333',
        borderWidth: 1,
        backgroundColor: "#fff",
        borderRadius: 25,
        color: '#333'
    },
    button: {
        padding: 12,
        backgroundColor: '#007AFF',
        borderRadius: 20,
    },
    buttonText:{
        color: '#fff',
        textAlign: 'center',
    },
    loading:{
        marginTop: 20,
    },
    error: {
        color: "red",
        marginTop: 10,
    }
})