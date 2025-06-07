import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import axios from 'axios';
import ChatBubble from "../../components/ChatBubble";
import { speak, isSpeakingAsync, stop } from "expo-speech";
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, orderBy, getDocs, limit, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { FITNESS_API_URL, SET_USER_ID } from '@/constants';

interface ChatMessage {
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
    id: string; // Firestore document ID for messages in fitnessMessages (if used) or unique client ID
    rl_episode_id?: string; // To link model's response to an RL episode
    // model_message_firestore_id is primarily for the feedback system using the message's own ID
    // but for RL, rl_episode_id is the key.
    model_message_firestore_id?: string; 
}

// Main Fitness_Chat component
export function Fitness_Chat() {
    // State variables for chat messages, user input, loading status, error messages, and speech status
    const [chat, setChat] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeakingSpeaker, setIsSpeaking] = useState(false);

    const currentUserID = FIREBASE_AUTH.currentUser?.uid;

    // Fetch initial chat history (from fitnessMessages) for display
    useEffect(() => {
        if (currentUserID) {
            const messagesRef = collection(FIREBASE_DB, "users", currentUserID, "fitnessMessages");
            const q = query(messagesRef,
                orderBy("timestamp", "desc"),
                limit(10),
        ); // limit then reverse to get the most recent messages first

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                var messages: ChatMessage[] = [];
                querySnapshot.forEach((doc) => {
                    messages.push({
                        id: doc.id,
                        role: doc.data().sender,
                        parts: [{ text: doc.data().content }],
                        rl_episode_id: doc.data().rl_episode_id, // Fetch if stored
                        model_message_firestore_id: doc.id, // For model messages, this is their own ID
                    });
                });
                messages = messages.reverse(); // Reverse to show most recent messages at the bottom
                setChat(messages);
            });
            return () => unsubscribe(); // Detach listener on unmount
        }
    }, [currentUserID]);

    // // Fetch recent chat messages from Firebase
    // async function getRecentFitnessChatbotMessages(db, userUid, messageLimit) {
    //     const messagesRef = collection(db, "users", userUid, "fitnessMessages");
    //     const q = query(
    //         messagesRef,
    //         orderBy("timestamp", "desc"),
    //         limit(messageLimit)
    //     );
    //     const querySnapshot = await getDocs(q);
    //     var messages = [];
    //     querySnapshot.forEach((doc) => {
    //         const messageData = {
    //             parts: [{ text: doc.data().content }],
    //             role: doc.data().sender,
    //             id: doc.id,
    //         };
    //         messages.push(messageData);
    //     });
    //     messages = messages.reverse();
    //     setChat(messages);
    // }

    // // Load messages on component mount
    // useEffect(() => {
    //     if(FIREBASE_AUTH.currentUser?.uid){
    //         getRecentFitnessChatbotMessages(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
    //     }
    //             // console.log("Stored Messages:",message);
    // }, []);

    const handleUserInput = async () => {
        if (!userInput.trim()) return;

        const currentUser = FIREBASE_AUTH.currentUser;
        if (!currentUser) {
            setError("User not authenticated. Please log in.");
            setLoading(false);
            return;
        }

        const userMessageText = userInput;
        setUserInput(""); // Clear input immediately

        // Optimistically add user message to UI (no need to save separately if backend saves it)
        const tempUserMsgId = `user-${Date.now()}`;
        const userMessageForUI: ChatMessage = {
            id: tempUserMsgId,
            role: 'user',
            parts: [{ text: userMessageText }],
        };
        setChat(prevChat => [...prevChat, userMessageForUI]);
        setLoading(true);
        setError('');

        try {
            // // Ensure backend knows the user (this might be better handled with auth tokens per request)
            // await axios.get(`${SET_USER_ID}/${currentUserID}`);
            // console.log("User ID set for Fitness API:", currentUserID);

            const idToken = await currentUser.getIDToken();

            const apiResponse = await axios.get(
                `${FITNESS_API_URL}/${encodeURIComponent(userMessageText)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${idToken}` // Send ID Token in Authorization header
                    }
                }
            );
            
            console.log("Backend API Response Data:", apiResponse.data);

            const modelText = apiResponse.data.response;
            const episodeIdFromServer = apiResponse.data.episode_id; // Key for RL feedback
            const modelMessageFirestoreId = apiResponse.data.model_message_firestore_id; // ID of the message in fitnessMessages

            if (modelText && episodeIdFromServer) {
                // UI update for model message is handled by onSnapshot listener if backend saves it
                // If backend doesn't save to fitnessMessages for display, add it here:
                // const modelMessageForUI: ChatMessage = {
                //     id: modelMessageFirestoreId || `model-${Date.now()}`, // Use actual ID if available
                //     role: 'model',
                //     parts: [{ text: modelText }],
                //     rl_episode_id: episodeIdFromServer,
                //     model_message_firestore_id: modelMessageFirestoreId
                // };
                // setChat(prevChat => [...prevChat, modelMessageForUI]);

                // The backend now saves both user and model messages to fitnessMessages
                // so the onSnapshot listener should pick them up.
            } else if (apiResponse.data.error_logging_rl) {
                setError(`Bot responded, but RL logging failed: ${apiResponse.data.error_logging_rl}`);
            } else {
                setError("Received an unexpected or empty response from the bot.");
            }
        } catch (err: any) {
            console.error("Error during handleUserInput:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Authentication failed. Please log in again.");
            } else {
                setError(err.response?.data?.error || err.message || "An error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // // Save a message to Firebase
    // async function addMessage(db, userUid, sender, text) {
    //     try {
    //         const messagesRef = collection(db, "users", userUid, "fitnessMessages");
    //         const newMessage = {
    //             sender: sender,
    //             content: text,
    //             timestamp: serverTimestamp(),
    //         };
    //         const docRef = await addDoc(messagesRef, newMessage);
    //         console.log("Document written with ID: ", docRef.id);
    //         return docRef;
    //     } catch (e) {
    //         console.error("Error adding document: ", e);
    //         throw e;
    //     }
    // }

    // // Handle user input and API call
    // const handleUserInput = async () => {
    //     // Update chat with user message
    //     let updatedChat = [
    //         ...chat,
    //         {
    //             role: 'user',
    //             parts: [{ text: userInput }],
    //         },
    //     ];
    //     setLoading(true);

    //     try {
    //         // Make API call to fetch bot response
    //         const USER_ID = FIREBASE_AUTH.currentUser?.uid;
    //         const set_user_id = await axios.get(`${SET_USER_ID}/${USER_ID}`);
    //         const response = await axios.get(`${FITNESS_API_URL}/${userInput}`);
    //         console.log("Agent Response", response.data['response']);

    //         if (response.data) {
    //             // Update chat with bot response
    //             const updatedChatWithModel = [
    //                 ...updatedChat,
    //                 {
    //                     role: 'model',
    //                     parts: [{ text: response.data['response'] }],
    //                 },
    //             ];
    //             setChat(updatedChatWithModel);

    //             // Save both user and bot messages to Firebase
    //             addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "user", userInput);
    //             addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "model", response.data['response']);
    //             setUserInput("");
    //             setError("");
    //         }
    //     } catch (error) {
    //         console.log("Error calling Fitness API", error);
    //         setError("An Error occurred, Please try again");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSpeech = async (textToSpeak: string) => {
        if (isSpeakingSpeaker) {
            await stop();
            setIsSpeaking(false);
        } else {
            if (!(await isSpeakingAsync())) {
                speak(textToSpeak);
                setIsSpeaking(true);
            }
        }
    };

    // // Handle speech synthesis for chat messages
    // const handleSpeech = async (text) => {
    //     if (isSpeaking) {
    //         stop();
    //         setIsSpeaking(false);
    //     } else {
    //         if (!(await isSpeakingAsync())) {
    //             speak(text);
    //             setIsSpeaking(true);
    //         }
    //     }
    // };

    const renderChatItem = ({ item }: { item: ChatMessage }) => {
        return (
            <ChatBubble
                role={item.role}
                text={item.parts[0].text}
                // For feedback, we now primarily care about rl_episode_id
                // messageId prop in ChatBubble can be used for non-RL feedback or unique key
                messageId={item.id} 
                rlEpisodeId={item.rl_episode_id} // Pass the rl_episode_id
                onSpeech={() => handleSpeech(item.parts[0].text)}
            />
        );
    };

    // // Render each chat message
    // const renderChatItem = ({ item }) => {
    //     return (
    //         <ChatBubble
    //             role={item.role}
    //             text={item.parts[0].text}
    //             messageId={item.id}
    //             onSpeech={() => handleSpeech(item.parts[0].text)}
    //         />
    //     );
    // };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fitness ChatBot</Text>
            <FlatList
                data={chat}
                renderItem={renderChatItem}
                keyExtractor={(item, index) => index.toString()} // Use unique message ID
                contentContainerStyle={styles.chatContainer}
                // inverted // Consider if new messages should appear at bottom and scroll up
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Ask fitness or nutrition questions..."
                />
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: userInput.trim() ? '#007AFF' : '#8bbff7' }]}
                    onPress={handleUserInput}
                    disabled={!userInput.trim() || loading}
                >
                    <MaterialCommunityIcons name="send" size={25} color="white" />
                </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator style={styles.loading} size="large" color="#007AFF" />}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

//     // Main render function
//     return (
//         <View style={styles.container}>
//             <Text style={styles.title}>Fitness ChatBot</Text>
//             <FlatList
//                 data={chat}
//                 renderItem={renderChatItem}
//                 keyExtractor={(item, index) => index.toString()}
//                 contentContainerStyle={styles.chatContainer}
//             />
//             <View style={styles.inputContainer}>
//                 <TextInput
//                     style={styles.input}
//                     value={userInput}
//                     onChangeText={setUserInput}
//                     placeholder="Type a message"
//                 />
//                 <TouchableOpacity
//                     style={[styles.button, { backgroundColor: userInput ? '#007AFF' : '#8bbff7' }]}
//                     onPress={handleUserInput}
//                     disabled={!userInput}
//                 >
//                     <Text style={styles.buttonText}>Send</Text>
//                 </TouchableOpacity>
//             </View>
//             {loading && <ActivityIndicator size="large" color="#0000ff" />}
//             {error && <Text style={styles.error}>{error}</Text>}
//         </View>
//     );
// }

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
