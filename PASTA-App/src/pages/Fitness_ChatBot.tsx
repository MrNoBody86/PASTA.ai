import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from "../../components/ChatBubble";
import { speak, isSpeakingAsync, stop } from "expo-speech";
<<<<<<< Updated upstream
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationProp } from '@react-navigation/native';
import { Logo2 } from '@/Images';
=======
>>>>>>> Stashed changes
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, orderBy, getDocs, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { YOUR_BACKEND_API_URL } from '@/constants';
import { SET_USER_ID } from '@/constants';

// Main Fitness_Chat component
export function Fitness_Chat() {
    // State variables for chat messages, user input, loading status, error messages, and speech status
    const [chat, setChat] = useState<Array<{ role: string; parts: Array<{ text: string }>; id?: string }>>([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Fetch recent chat messages from Firebase
    async function getRecentFitnessChatbotMessages(db, userUid, messageLimit) {
        const messagesRef = collection(db, "users", userUid, "fitnessMessages");
        const q = query(messagesRef, orderBy("timestamp", "desc"), limit(messageLimit));
        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push({
                parts: [{ text: doc.data().content }],
                role: doc.data().sender,
                id: doc.id, // This is the Firestore document ID
            });
        });
        setChat(messages.reverse());
    }

    useEffect(() => {
        if (FIREBASE_AUTH.currentUser?.uid) {
            getRecentFitnessChatbotMessages(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
        }
    }, []);

    // --- Existing addMessage function to save to Firestore ---
    async function addMessage(db, userUid, sender, text, firestoreDocId = null) { // Added optional firestoreDocId
        try {
            const messagesRef = collection(db, "users", userUid, "fitnessMessages");
            const newMessage = {
                sender: sender,
                content: text,
                timestamp: serverTimestamp(),
            };
            // If firestoreDocId is provided (e.g., the RL messageId), use it as the document ID
            // This helps if you want to directly query Firestore using the RL messageId.
            // Otherwise, Firestore will auto-generate an ID.
            const docRef = firestoreDocId ? await messagesRef.doc(firestoreDocId).set(newMessage) : await addDoc(messagesRef, newMessage);
            console.log("Firestore: Message saved with ID: ", firestoreDocId || docRef.id);
            return docRef;
        } catch (e) {
            console.error("Firestore: Error adding document: ", e);
            throw e;
        }
    }

    const handleUserInput = async () => {
        if (!userInput.trim() || !FIREBASE_AUTH.currentUser) return;

        const userMessage = {
            role: 'user',
            parts: [{ text: userInput }],
            // User messages typically won't have a backend-generated RL ID unless you adapt further
        };
        const updatedChatWithUser = [...chat, userMessage];
        setChat(updatedChatWithUser);
        const currentInput = userInput;
        setUserInput(""); // Clear input immediately for better UX
        setLoading(true);
        setError('');

        try {
            // **IMPORTANT**: For production, replace global USER_ID setting with token authentication
            // For temporary testing with your /get_userid/ endpoint:
            const tempUserId = FIREBASE_AUTH.currentUser.uid;
            try {
                // This call is ONLY for the temporary global USER_ID setup on your backend
                // REMOVE this when you implement proper token-based auth in your backend
                await axios.get(`${YOUR_BACKEND_API_URL}/get_userid/${tempUserId}`);
                console.log(`TEMP: Set backend USER_ID to ${tempUserId}`);
            } catch (setupError) {
                console.warn("TEMP: Failed to set backend USER_ID (this is okay if backend already has it or uses token auth)", setupError);
            }
            // **END IMPORTANT**

            // --- Call your RL-enhanced backend ---
            const apiResponse = await axios.get(
                `${YOUR_BACKEND_API_URL}/get_fitness_content/${encodeURIComponent(currentInput)}`
                // TODO: Add Authorization header with Firebase ID Token once backend supports it
                // { headers: { 'Authorization': `Bearer ${await FIREBASE_AUTH.currentUser.getIdToken()}` } }
            );

            const modelResponseMessage = apiResponse.data?.response;
            const backendRlMessageId = apiResponse.data?.messageId; // <<< GET THE RL MESSAGE ID

            if (modelResponseMessage && backendRlMessageId) {
                const modelMessage = {
                    role: 'model',
                    parts: [{ text: modelResponseMessage }],
                    id: backendRlMessageId, // <<< STORE THE BACKEND-GENERATED RL ID
                };
                setChat(prevChat => [...prevChat, modelMessage]); // Add to the chat shown to user

                // Save user message to Firestore (if you haven't already outside this try block)
                 await addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, "user", currentInput);
                // Save model message to Firestore
                // You can choose to use backendRlMessageId as the Firestore document ID if it's unique
                // or just save it as a field within the document.
                await addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, "model", modelResponseMessage, backendRlMessageId);

            } else {
                console.error("Backend Error: Missing response or messageId from backend", apiResponse.data);
                setError("Received an incomplete response from the server.");
            }
        } catch (error: any) {
            console.error("Error calling Fitness RL API:", error.response?.data || error.message);
            setError(error.response?.data?.error || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSpeech = async (text) => {
        // ... (your existing speech logic) ...
        if (isSpeaking) {
            await stop();
            setIsSpeaking(false);
        } else {
            if (!(await isSpeakingAsync())) {
                speak(text, { onDone: () => setIsSpeaking(false), onError: () => setIsSpeaking(false) });
                setIsSpeaking(true);
            }
        }
    };

    const renderChatItem = ({ item }: { item: { role: string; parts: Array<{ text: string }>; id?: string } }) => {
        return (
            <ChatBubble
                role={item.role}
                text={item.parts[0].text}
                // Pass the 'id' from the chat item as 'messageId' prop to ChatBubble.
                // For model messages, this will be the backendRlMessageId.
                // For user messages or older model messages (before this change), it might be Firestore ID or undefined.
                messageId={item.id} 
                onSpeech={() => handleSpeech(item.parts[0].text)}
                // No onRatingChange needed if ChatBubble handles its own submission
            />
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fitness ChatBot (RL)</Text>
            <FlatList
                data={chat}
                renderItem={renderChatItem}
                keyExtractor={(item, index) => item.id || index.toString()} // Use item.id if available for key
                contentContainerStyle={styles.chatContainer}
                // automaticallyScrollToBottom // Consider adding this or a ref to scroll
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Ask about fitness..."
                />
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: userInput.trim() ? '#007AFF' : '#8bbff7' }]}
                    onPress={handleUserInput}
                    disabled={!userInput.trim() || loading}
                >
<<<<<<< Updated upstream
                    <MaterialCommunityIcons name="send" size={25} color="white" />
=======
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Send</Text>}
>>>>>>> Stashed changes
                </TouchableOpacity>
            </View>
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
