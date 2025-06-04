import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'; // Added Text for feedback submitted
import Markdown from 'react-native-markdown-display';
import React, { useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig'; // For current user and Firestore operations
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import axios from 'axios'; // For sending RL feedback to backend
import { YOUR_BACKEND_API_URL } from '@/constants'; // Your backend URL

// Props definition
interface ChatBubbleProps {
  role: 'user' | 'model';
  text: string;
  messageId?: string; // This ID is crucial. For MODEL messages, it should be the backendRlMessageId.
  onSpeech: () => void;
}
// ChatBubble component to display individual chat messages
// Props:
// - role: indicates if the message is from the user or the model
// - text: the message text to be displayed
// - onSpeech: function to handle text-to-speech for model messages
const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text, messageId, onSpeech }) => {
  const [rating, setRating] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false); // For Firestore feedback status
  const [isRLFeedbackSent, setIsRLFeedbackSent] = useState(false); // For RL backend feedback status
  const currentUser = FIREBASE_AUTH.currentUser;

  // Check if feedback (to Firestore) was already submitted for this messageId
  useEffect(() => {
    const checkFirestoreFeedbackSubmitted = async () => {
      if (!currentUser?.uid || !messageId || role !== 'model') return;
      try {
        const feedbackRef = collection(FIREBASE_DB, "users", currentUser.uid, "feedback");
        const feedbackQuery = query(feedbackRef, where("messageId", "==", messageId));
        const snapshot = await getDocs(feedbackQuery);
        if (!snapshot.empty) {
          setIsRatingSubmitted(true);
          setRating(snapshot.docs[0].data().starRating || 0);
        }
      } catch (e) {
        console.error("Error checking for existing Firestore feedback: ", e);
      }
    };
    checkFirestoreFeedbackSubmitted();
  }, [messageId, currentUser, role]);


  const handleRatingChange = (newRating: number) => {
    if (isRatingSubmitted || isRLFeedbackSent) return; // Don't change if already submitted
    setRating(newRating);
  };

  const submitCombinedFeedback = async () => {
    if (rating === 0 || !currentUser || !messageId || role !== 'model') return;

    // 1. Submit to Firestore (for your records/other uses)
    if (!isRatingSubmitted) {
      try {
        const feedbackRef = collection(FIREBASE_DB, "users", currentUser.uid, "feedback");
        await addDoc(feedbackRef, {
          messageId: messageId, // Use the RL messageId here if you want to link them
          starRating: rating,
          textPreview: text.substring(0, 100), // Optional: store a preview
          timestamp: serverTimestamp(),
        });
        setIsRatingSubmitted(true);
        console.log("Firestore Feedback: Submitted for messageId:", messageId);
      } catch (e) {
        console.error("Firestore Feedback: Error submitting: ", e);
        // Potentially show an error to the user for Firestore submission failure
      }
    }

    // 2. Submit to RL Backend
    if (!isRLFeedbackSent) { // Check this separately in case Firestore call was faster
      try {
        console.log(`RL Feedback: Sending for messageId: ${messageId}, rating: ${rating}`);
        await axios.post(
          `${YOUR_BACKEND_API_URL}/log_chatbot_feedback`,
          {
            messageId: messageId, // This is the backendRlMessageId
            starRating: rating,
          }
          // TODO: Add Authorization header with Firebase ID Token once backend supports it
          // { headers: { 'Authorization': `Bearer ${await currentUser.getIdToken()}` } }
        );
        setIsRLFeedbackSent(true); // Mark RL feedback as sent
        console.log("RL Backend Feedback: Submitted for messageId:", messageId);
      } catch (error) {
        console.error("RL Backend Feedback: Error submitting: ", error);
        // Potentially show an error to the user for RL feedback submission failure
      }
    }
  };

  const showFeedbackSection = role === 'model' && messageId; // Only for model messages with an ID

  return (
    <View style={[styles.chatItem, role === "user" ? styles.userChatItem : styles.modelChatItem]}>
      <Markdown style={markdownStyles}>{text}</Markdown>

      {showFeedbackSection && (
        <>
          <TouchableOpacity style={styles.speakerIcon} onPress={onSpeech}>
            <Ionicons name="volume-high-outline" size={24} color={role === 'model' ? "#fff" : "#333"} />
          </TouchableOpacity>

          {!isRatingSubmitted && !isRLFeedbackSent && ( // Show rating stars only if not yet submitted fully
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <TouchableOpacity key={i} onPress={() => handleRatingChange(i + 1)} disabled={isRatingSubmitted || isRLFeedbackSent}>
                  <Ionicons
                    name={i < rating ? 'star' : 'star-outline'}
                    size={24}
                    color="#FFD700" // Gold color for stars
                  />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={submitCombinedFeedback}
                disabled={rating === 0 || isRatingSubmitted || isRLFeedbackSent}
                style={[
                  styles.submitButton,
                  { opacity: (rating === 0 || isRatingSubmitted || isRLFeedbackSent) ? 0.5 : 1 },
                ]}
              >
                <MaterialCommunityIcons name="check-bold" size={20} color="white" />
              </TouchableOpacity>
            </View>
          )}

          {(isRatingSubmitted || isRLFeedbackSent) && ( // Show "Feedback Submitted" if either is done
            <View style={styles.feedbackSubmitted}>
              <MaterialCommunityIcons name="check-circle" size={22} color="#4CAF50" />
              <Text style={styles.feedbackSubmittedText}>Feedback Submitted</Text>
            </View>
          )}
        </>
      )}
      {/* For user messages, if you want a speaker icon without feedback */}
      {role === 'user' && (
         <TouchableOpacity style={styles.speakerIconUser} onPress={onSpeech}>
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

    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      gap: 4,
    },
    
    submitButton: {
      backgroundColor: 'black',
      borderRadius: 10,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    
    feedbackSubmitted: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },
});

const markdownStyles = {
  body: {
    color: "white",
    fontSize: 14,
  },

  bullet_list: {
    marginVertical: 4,
  },

  list_item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  list_item_content: {
    flex: 1,
    color: 'white',
  },
  
  strong: {
    fontWeight: 'bold',
    color: 'white',
  },
};

