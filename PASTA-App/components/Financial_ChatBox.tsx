import React, { useState, useCallback, useEffect,  } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import axios from 'axios';
import ChatBubble from "./ChatBubble";
import { speak, isSpeakingAsync, stop } from "expo-speech";
import { NavigationProp } from '@react-navigation/native';
import { Logo2 } from '@/Images';
import api from '@/api';
// import { query } from 'firebase/firestore';


export function Financial_Chat() {
    const [chat, setChat] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);

    // const API_KEY = REACT_APP_GEMINI_API_KEY;
    const API_URL = "http://127.0.0.1:8000/get_stock_content/get%20nvda%20stock%20price";
    // const { GoogleGenerativeAI } = require("@google/generative-ai");
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
            console.log("Hello")
            const response = await axios.get(`http://localhost:8000/hello`)

            console.log("Agent Response", response);

            // const modelResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (response) {
                const updatedChatWithModel = [
                    ...updatedChat,
                    {
                        role: 'model',
                        parts: [{text: response}],
                    },
                ];
                setChat(updatedChatWithModel);
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
                <TouchableOpacity style={styles.button} onPress={handleUserInput}>
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    )

    
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