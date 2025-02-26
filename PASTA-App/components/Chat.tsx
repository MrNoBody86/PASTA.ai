import React, { useState, useCallback, useEffect,  } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from "./ChatBubble";
import { speak, isSpeakingAsync, stop } from "expo-speech";
import { NavigationProp } from '@react-navigation/native';
import { Logo2 } from '@/Images';
import { REACT_APP_GEMINI_API_KEY } from '@/constants';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, where, orderBy, getDocs, limit, addDoc, serverTimestamp, onSnapshot, Timestamp } from "firebase/firestore";

export function Chat() {
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const API_KEY = REACT_APP_GEMINI_API_KEY;

    async function getRecentFinancialChatbotMessages(db, userUid, messageLimit) {
        const messagesRef = collection(db, "users", userUid, "geminiMessages");
        const q = query(
            messagesRef,
            orderBy("timestamp"), // order ascending, oldest first.
            limit(messageLimit)
        );
        const querySnapshot = await getDocs(q);
        const messages = [];
        querySnapshot.forEach((doc) => {
            // console.log("Document  => ", doc.data());
            const messageData = {
                parts: [{text: doc.data().content}] ,
                role: doc.data().sender,
                // timestamp: doc.data().timestamp,
            }
            messages.push(messageData);
        });
        setChat(messages)
    }

    useEffect(() => {
        getRecentFinancialChatbotMessages(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 20);
    })
    
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
          return docRef; //return the document reference.
        } catch (e) {
          console.error("Error adding document: ", e);
          throw e; //rethrow the error to be handled by the caller.
        }
      }

    const handleUserInput = async () => {
        // Add user input to chat
        let updatedChat = [
            ...chat,
            {
                role: 'user',
                parts: [{text: userInput}],
            },
        ];
        
        setLoading(true);

        try{
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
                        parts: [{text: modelResponse}],
                    },
                ];
                setChat(updatedChatWithModel);
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "user", userInput)
                addMessage(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, "model", modelResponse)
                setUserInput("");
                
            }

        } catch (error: any) {
            console.log("Error calling Gemini", error);
            console.log("Error response", error.response);
            setError("An Error occured, Please try again");
        } finally {
            setLoading(false);
        }
    }

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
    }

    const renderChatItem = ({ item }) => {
        return (
            <ChatBubble 
                role={item.role} 
                text={item.parts[0].text} 
                onSpeech={() => handleSpeech(item.parts[0].text)}
            />
        );
    };
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
                <TouchableOpacity style={[styles.button, {backgroundColor: userInput ? '#007AFF' : '#8bbff7'}]} onPress={handleUserInput} disabled={userInput ? false : true}>
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    )
    
}

export default Chat;

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