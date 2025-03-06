// Import necessary components and libraries from React Native and Expo
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

// ChatBubble component to display individual chat messages
// Props:
// - role: indicates if the message is from the user or the model
// - text: the message text to be displayed
// - onSpeech: function to handle text-to-speech for model messages
const ChatBubble = ({ role, text, onSpeech }) => {
  return (
    <View
      style={[
        styles.chatItem,
        role === "user" ? styles.userChatItem : styles.modelChatItem,  // Apply different styles based on the sender
      ]}>
      <Text style={styles.chatText}>{text}</Text>
      
      {/* Show speaker icon for model messages to enable text-to-speech */}
      {role === "model" && (
        <TouchableOpacity style={styles.speakerIcon} onPress={onSpeech}>
          <Ionicons name="volume-high-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ChatBubble;

// Styles for the ChatBubble component
const styles = StyleSheet.create({
    chatItem: {
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        maxWidth: "80%",
        position: "relative",
    },
    userChatItem: {
        backgroundColor: "#007AFF",
        alignSelf: "flex-end",
    },
    modelChatItem: {
        backgroundColor: "black",
        alignSelf: "flex-start",
        paddingBottom: 30,
    },
    chatText: {
        color: "white",
    },
    chatTextUser: {
        color: "#fff",
    },
    speakerIcon: {
        position: "absolute",
        right: 10,
        bottom: 2,
    },
});
