import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from "../../components/ChatBubble";
import { speak, isSpeakingAsync, stop } from "expo-speech";
import { NavigationProp } from '@react-navigation/native';
import { Logo2 } from '@/Images';
import { REACT_APP_GEMINI_API_KEY } from '@/constants';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, where, orderBy, getDocs, limit, addDoc, serverTimestamp, onSnapshot, Timestamp } from "firebase/firestore";

// Chat component handles the chat interface and communication with Gemini API and Firebase
export function Chat() {
    // State variables to manage chat, user input, loading status, error messages, and speech status
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const API_KEY = REACT_APP_GEMINI_API_KEY;  // Gemini API key

    // Function to fetch recent messages from Firebase
    async function getRecentChatbotMessages(db, userUid, messageLimit) {
        const messagesRef = collection(db, "users", userUid, "geminiMessages");
        const q = query(
            messagesRef,
            orderBy("timestamp"), // Orders messages by timestamp (oldest first)
            limit(messageLimit)   // Limits the number of messages fetched
        );
        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            const messageData = {
                parts: [{ text: doc.data().content }],
                role: doc.data().sender,
            };
            messages.push(messageData);
        });
        setChat(messages);  // Updates the chat state with fetched messages
    }

    // useEffect to fetch messages when the component mounts
    useEffect(() => {
        if(FIREBASE_AUTH.currentUser?.uid){
                    getRecentChatbotMessages(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
                }
                // console.log("Stored Messages:",message);
    }, []);  // Empty dependency array to run only once on mount
    
    // Function to add a new message to Firebase
    async function addMessage(db, userUid, sender, text) {
        try {
            const messagesRef = collection(db, "users", userUid, "geminiMessages");
            const newMessage = {
                sender: sender,
                content: text,
                timestamp: serverTimestamp(),
            };
            const docRef = await addDoc(messagesRef, newMessage);
            console.log("Document written with ID: ", docRef.id);
            return docRef;  // Returns the document reference after adding the message
        } catch (e) {
            console.error("Error adding document: ", e);
            throw e;  // Throws error to be handled by the caller
        }
    }

    // Function to handle user input and send request to Gemini API
    const handleUserInput = async () => {
        // Adds user input to the chat state
        let updatedChat = [
            ...chat,
            {
                role: 'user',
                parts: [{ text: userInput }],
            },
        ];
        
        setLoading(true);  // Shows loading indicator

        try {
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    contents: updatedChat,
                }
            );

            console.log("Gemini Response", response.data);

            const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (modelResponse) {
                const updatedChatWithModel = [
                    ...updatedChat,
                    {
                        role: 'model',
                        parts: [{ text: modelResponse }],
                    },
                ];
                setChat(updatedChatWithModel);  // Updates chat state with the model's response
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "user", userInput);  // Saves user's message to Firebase
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "model", modelResponse);  // Saves model's response to Firebase
                setUserInput("");  // Clears user input
                setError("");
            }

        } catch (error: any) {
            console.log("Error calling Gemini", error);
            console.log("Error response", error.response);
            setError("An Error occurred, Please try again");
        } finally {
            setLoading(false);  // Hides loading indicator
        }
    }

    // Function to handle text-to-speech functionality
    const handleSpeech = async (text) => {
        if (isSpeaking) {
            stop();  // Stops speech if already speaking
            setIsSpeaking(false);
        } else {
            if (!(await isSpeakingAsync())) {
                speak(text);  // Converts text to speech
                setIsSpeaking(true);
            }            
        }
    }

    // Renders each chat message using ChatBubble component
    const renderChatItem = ({ item }) => {
        return (
            <ChatBubble 
                role={item.role} 
                text={item.parts[0].text} 
                onSpeech={() => handleSpeech(item.parts[0].text)}
            />
        );
    };

    // Main UI of the Chat component
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Gemini ChatBot</Text>
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

export default Chat;

// Styles for the Chat component
const styles = StyleSheet.create({
    container: {
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
        textAlign: 'center',
    },
    chatContainer: {
        flexGrow: 1,
        justifyContent: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row', 
        alignItems: 'center',
        marginTop: 10,
    },
    input: {
        flex: 1,
        height: 50,
        marginRight: 10,
        padding: 8,
        borderColor: '#333',
        borderWidth: 1,
        backgroundColor: "#fff",
        borderRadius: 25,
        color: '#333',
    },
    button: {
        padding: 12,
        backgroundColor: '#007AFF',
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
    },
    loading: {
        marginTop: 20,
    },
    error: {
        color: "red",
        marginTop: 10,
    },
});
