// Import necessary components and libraries from React Native and Expo
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import React, { useState, useCallback, useEffect }from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { Pressable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDocs, query, where } from 'firebase/firestore';




// ChatBubble component to display individual chat messages
// Props:
// - role: indicates if the message is from the user or the model
// - text: the message text to be displayed
// - onSpeech: function to handle text-to-speech for model messages
const ChatBubble = ({ role, text, messageId, onSpeech,}) => {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);


  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    console.log(`Rated ${newRating} stars for: ${text}`);
  };

  // Send feedback to firestore
  async function handleSubmit(db, userUid, messageId, starRating) {
    if (submitted || rating === 0) return;
    try {
        const feedbackRef = collection(db, "users", userUid, "feedback");
        const feedback = {
            messageId: messageId,
            starRating: starRating,
            timestamp: serverTimestamp(),
        };
        const docRef = await addDoc(feedbackRef, feedback);
        setSubmitted(true);
        console.log("Rating submitted:", feedback);
        console.log("Document written with ID: ", docRef.id);
        return docRef;
        } catch (e) {
          console.error("Error submitting the rating: ", e);
          throw e;
        }
  }

  useEffect(() => {
    const checkFeedbackSubmitted = async () => {
      if (!FIREBASE_AUTH.currentUser?.uid || !messageId) return;
  
      try {
        const feedbackRef = collection(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser.uid, "feedback");
        const feedbackQuery = query(feedbackRef, where("messageId", "==", messageId));
        const snapshot = await getDocs(feedbackQuery);
  
        if (!snapshot.empty) {
          setSubmitted(true); // Feedback exists, disable rating
          const existing = snapshot.docs[0].data();
          setRating(existing.starRating); // Optional: show previously selected stars
        }
      } catch (e) {
        console.error("Error checking for existing feedback: ", e);
      }
    };
  
    checkFeedbackSubmitted();
  }, [messageId]);
  

  // const handlePress = (index: number) => {
  //   onRatingChange(index + 1); // Rating is 1-indexed
  // };

  return (
    <View
      style={[
        styles.chatItem,
        role === "user" ? styles.userChatItem : styles.modelChatItem,  // Apply different styles based on the sender
      ]}>
      <Markdown style={markdownStyles}>{text}</Markdown>

      {role === "model" && (
      <>
         {/* Speaker button for TTS */}
        <TouchableOpacity style={styles.speakerIcon} onPress={onSpeech}>
          <Ionicons name="volume-high-outline" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Rating & submit section */}
        {!submitted && (
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, i) => (
                <TouchableOpacity key={i} onPress={() => handleRatingChange(i + 1)}>
                  <Ionicons
                    name={i < rating ? 'star' : 'star-outline'}
                    size={24}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
              <Pressable
                onPress={() => handleSubmit(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, messageId, rating)}
                disabled={rating === 0}
                style={[
                  styles.submitButton,
                  { opacity: rating === 0 ? 0.5 : 1 },
                ]}
              >
                <MaterialCommunityIcons name="check" size={25} color="white" />
              </Pressable>
            </View>
          )}

          {/* Show confirmation once submitted */}
          {submitted && (
            <View style={styles.feedbackSubmitted}>
              <MaterialCommunityIcons
                name="check-circle"
                size={22}
                color="#4CAF50"
              />
            </View>
          )}
      </>
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

