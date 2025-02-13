import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

const ChatBubble = ({ role, text, onSpeech }) => {
  return (
    <View
      style={[
        styles.chatItem,
        role === "user" ? styles.userChatItem : styles.modelChatItem,
      ]}>
      <Text style={styles.chatText}>{text}</Text>
      {role === "model" && (
        <TouchableOpacity style={styles.speakerIcon} onPress={onSpeech}>
            <Ionicons name="volume-high-outline" size={24} color="#fff" />
        </TouchableOpacity>
        )}
    </View>
  )
}

export default ChatBubble;

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
        bottom: 7,
    },
})