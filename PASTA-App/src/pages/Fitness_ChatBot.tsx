import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from "../../components/ChatBubble";
import { speak, isSpeakingAsync, stop } from "expo-speech";
import { NavigationProp } from '@react-navigation/native';
import { Logo2 } from '@/Images';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, orderBy, getDocs, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { FITNESS_API_URL } from '@/constants';

// Main Fitness_Chat component
export function Fitness_Chat() {
    // State variables for chat messages, user input, loading status, error messages, and speech status
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Fetch recent chat messages from Firebase
    async function getRecentFitnessChatbotMessages(db, userUid, messageLimit) {
        const messagesRef = collection(db, "users", userUid, "fitnessMessages");
        const q = query(
            messagesRef,
            orderBy("timestamp"),
            limit(messageLimit)
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
        setChat(messages);
    }

    // Load messages on component mount
    useEffect(() => {
        if(FIREBASE_AUTH.currentUser?.uid){
                    getRecentFitnessChatbotMessages(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
                }
                // console.log("Stored Messages:",message);
    }, []);

    // Save a message to Firebase
    async function addMessage(db, userUid, sender, text) {
        try {
            const messagesRef = collection(db, "users", userUid, "fitnessMessages");
            const newMessage = {
                sender: sender,
                content: text,
                timestamp: serverTimestamp(),
            };
            const docRef = await addDoc(messagesRef, newMessage);
            console.log("Document written with ID: ", docRef.id);
            return docRef;
        } catch (e) {
            console.error("Error adding document: ", e);
            throw e;
        }
    }

    // Handle user input and API call
    const handleUserInput = async () => {
        // Update chat with user message
        let updatedChat = [
            ...chat,
            {
                role: 'user',
                parts: [{ text: userInput }],
            },
        ];
        setLoading(true);

        try {
            // Make API call to fetch bot response
            const response = await axios.get(`${FITNESS_API_URL}/${userInput}`);
            console.log("Agent Response", response.data['response']);

            if (response.data) {
                // Update chat with bot response
                const updatedChatWithModel = [
                    ...updatedChat,
                    {
                        role: 'model',
                        parts: [{ text: response.data['response'] }],
                    },
                ];
                setChat(updatedChatWithModel);

                // Save both user and bot messages to Firebase
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "user", userInput);
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "model", response.data['response']);
                setUserInput("");
                setError("");
            }
        } catch (error) {
            console.log("Error calling Fitness API", error);
            setError("An Error occurred, Please try again");
        } finally {
            setLoading(false);
        }
    };

    // Handle speech synthesis for chat messages
    const handleSpeech = async (text) => {
        if (isSpeaking) {
            stop();
            setIsSpeaking(false);
        } else {
            if (!(await isSpeakingAsync())) {
                speak(text);
                setIsSpeaking(true);
            }
        }
    };

    // Render each chat message
    const renderChatItem = ({ item }) => {
        return (
            <ChatBubble
                role={item.role}
                text={item.parts[0].text}
                onSpeech={() => handleSpeech(item.parts[0].text)}
            />
        );
    };

    // Main render function
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fitness ChatBot</Text>
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

export default Fitness_Chat;

// Styles for the component
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
