// Import necessary components and libraries from React Native and Expo
import React, { useState, useCallback, useEffect }from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { Pressable } from 'react-native-gesture-handler';
import { getDocs, query, where } from 'firebase/firestore';
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { SUBMIT_RL_EPISODE_FEEDBACK_URL } from '@/constants';


interface ChatBubbleProps {
  role: 'user' | 'model';
  text: string;
  messageId?: string; // Firestore ID of the message in fitnessMessages/geminiMessages
  rlEpisodeId?: string; // ID of the RL episode document
  onSpeech: () => void;
}

// ChatBubble component to display individual chat messages
// Props:
// - role: indicates if the message is from the user or the model
// - text: the message text to be displayed
// - onSpeech: function to handle text-to-speech for model messages
const ChatBubble = ({ role, text, messageId, rlEpisodeId, onSpeech,}) => {
  const [rating, setRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false); // To disable while submitting

  const currentUserID = FIREBASE_AUTH.currentUser?.uid;

  // Check if feedback was already submitted for this RL episode
  useEffect(() => {
    const checkExistingFeedback = async () => {
        if (role === 'model' && currentUserID && rlEpisodeId) {
            setIsLoadingFeedback(true);
            try {
                const episodeDocRef = doc(FIREBASE_DB, "users", currentUserID, "rl_episodes", rlEpisodeId);
                const docSnap = await getDoc(episodeDocRef);
                if (docSnap.exists()) {
                    const episodeData = docSnap.data();
                    if (episodeData.reward?.explicitFeedbackSource === "star_rating_v1" && 
                        typeof episodeData.reward.details?.originalStarRating === 'number') {
                        setRating(episodeData.reward.details.originalStarRating);
                        setIsSubmitted(true);
                    }  else {
                      // If docSnap doesn't exist, it means no feedback yet for this NEW episode.
                      // Ensure isSubmitted is false and rating is 0 for new episodes.
                      setIsSubmitted(false);
                      setRating(0);
                      console.log(`No existing feedback found for rlEpisodeId: ${rlEpisodeId}. Resetting UI.`);
                    }
                }
            } catch (error) {
                console.error("Error checking existing RL feedback:", error);
                setIsSubmitted(false);
                setRating(0);
            } finally {
                setIsLoadingFeedback(false);
            }
        }
        else if (role === 'model' && !rlEpisodeId) {
          // If it's a model message but has no rlEpisodeId (e.g. error during episode creation on backend)
          // then feedback UI shouldn't appear or should be disabled by default.
          // The current logic in the return() statement handles this:
          // {role === "model" && rlEpisodeId && ( ... feedback UI ... )}
          // So, this part of useEffect might not be strictly necessary unless you want to explicitly reset.
          setIsSubmitted(false);
          setRating(0);
        }
    };
    checkExistingFeedback();
  }, [currentUserID, rlEpisodeId, role]);

  const handleRatingChange = (newRating: number) => {
    if (isSubmitted || isLoadingFeedback) return;
    setRating(newRating);
  };

  const handleSubmitFeedback = async () => {
    const currentUser = FIREBASE_AUTH.currentUser;
    if (isSubmitted || rating === 0 || !currentUserID || !rlEpisodeId || isLoadingFeedback) {
        console.log("Feedback submission skipped:", { isSubmitted, rating, currentUserID, rlEpisodeId });
        return;
    }
    setIsLoadingFeedback(true);
    setFeedbackError(null);

    try {
        const idToken = await currentUser.getIdToken();
        // Call the backend endpoint to submit feedback for the RL episode
        const response = await axios.post(
            SUBMIT_RL_EPISODE_FEEDBACK_URL, 
            {
                episode_id: rlEpisodeId,
                star_rating: rating,
            },
            { // Axios config
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                }
            }
        );

        if (response.data.success) {
            setIsSubmitted(true);
            console.log("RL Feedback submitted successfully via API:", response.data.message);
        } else {
            console.error("Backend error submitting RL feedback:", response.data.error);
            setFeedbackError(response.data.error || "Failed to submit feedback.");
        }
    } catch (err: any) {
        console.error("API error submitting RL feedback:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
            console.error("Authentication failed. Please log in again.");
        } else {
            console.error(err.response?.data?.error || err.message || "An API error occurred.");
        }
    } finally {
        setIsLoadingFeedback(false);
    }
  };


  // const handleRatingChange = (newRating: number) => {
  //   setRating(newRating);
  //   console.log(`Rated ${newRating} stars for: ${text}`);
  // };

  // // Send feedback to firestore
  // async function handleSubmit(db, userUid, messageId, starRating) {
  //   if (submitted || rating === 0) return;
  //   try {
  //       const feedbackRef = collection(db, "users", userUid, "feedback");
  //       const feedback = {
  //           messageId: messageId,
  //           starRating: starRating,
  //           timestamp: serverTimestamp(),
  //       };
  //       const docRef = await addDoc(feedbackRef, feedback);
  //       setSubmitted(true);
  //       console.log("Rating submitted:", feedback);
  //       console.log("Document written with ID: ", docRef.id);
  //       return docRef;
  //       } catch (e) {
  //         console.error("Error submitting the rating: ", e);
  //         throw e;
  //       }
  // }

  // useEffect(() => {
  //   const checkFeedbackSubmitted = async () => {
  //     if (!FIREBASE_AUTH.currentUser?.uid || !messageId) return;
  
  //     try {
  //       const feedbackRef = collection(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser.uid, "feedback");
  //       const feedbackQuery = query(feedbackRef, where("messageId", "==", messageId));
  //       const snapshot = await getDocs(feedbackQuery);
  
  //       if (!snapshot.empty) {
  //         setSubmitted(true); // Feedback exists, disable rating
  //         const existing = snapshot.docs[0].data();
  //         setRating(existing.starRating); // Optional: show previously selected stars
  //       }
  //     } catch (e) {
  //       console.error("Error checking for existing feedback: ", e);
  //     }
  //   };
  
  //   checkFeedbackSubmitted();
  // }, [messageId]);
  

  // // const handlePress = (index: number) => {
  // //   onRatingChange(index + 1); // Rating is 1-indexed
  // // };

  return (
    <View style={[styles.chatItem, role === "user" ? styles.userChatItem : styles.modelChatItem]}>
        <Markdown style={markdownStyles}>{text}</Markdown>

        {role === "model" && ( // Show speaker and feedback only for model messages
            <>
                <TouchableOpacity style={styles.speakerIcon} onPress={onSpeech} disabled={isLoadingFeedback}>
                    <Ionicons name="volume-high-outline" size={24} color="#fff" />
                </TouchableOpacity>

                {rlEpisodeId && ( // Only show feedback UI if there's an rlEpisodeId
                    <>
                        {!isSubmitted && !isLoadingFeedback && (
                            <View style={styles.ratingContainer}>
                                {[...Array(5)].map((_, i) => (
                                    <TouchableOpacity key={i} onPress={() => handleRatingChange(i + 1)}>
                                        <Ionicons
                                            name={i < rating ? 'star' : 'star-outline'}
                                            size={20} // Slightly smaller stars
                                            color={isSubmitted ? "#BDBDBD" : "#FFD700"} // Grey out if submitted
                                        />
                                    </TouchableOpacity>
                                ))}
                                <Pressable
                                    onPress={handleSubmitFeedback}
                                    disabled={rating === 0 || isSubmitted || isLoadingFeedback}
                                    style={[
                                        styles.submitButton,
                                        { opacity: (rating === 0 || isSubmitted || isLoadingFeedback) ? 0.5 : 1 },
                                    ]}
                                >
                                    <MaterialCommunityIcons name="check" size={20} color="white" />
                                </Pressable>
                            </View>
                        )}
                        {isSubmitted && !isLoadingFeedback && (
                            <View style={styles.feedbackSubmitted}>
                                <MaterialCommunityIcons name="star-circle" size={18} color="#FFD700" />
                                <Text style={styles.feedbackSubmittedText}> Rated {rating} Stars</Text>
                            </View>
                        )}
                        {isLoadingFeedback && <ActivityIndicator size="small" color="#FFD700" />}
                        {feedbackError && <Text style={styles.errorText}>{feedbackError}</Text>}
                    </>
                )}
            </>
        )}
    </View>
);
};

//   return (
//     <View
//       style={[
//         styles.chatItem,
//         role === "user" ? styles.userChatItem : styles.modelChatItem,  // Apply different styles based on the sender
//       ]}>
//       <Markdown style={markdownStyles}>{text}</Markdown>

//       {role === "model" && (
//       <>
//          {/* Speaker button for TTS */}
//         <TouchableOpacity style={styles.speakerIcon} onPress={onSpeech}>
//           <Ionicons name="volume-high-outline" size={24} color="#fff" />
//         </TouchableOpacity>

//         {/* Rating & submit section */}
//         {!submitted && (
//             <View style={styles.ratingContainer}>
//               {[...Array(5)].map((_, i) => (
//                 <TouchableOpacity key={i} onPress={() => handleRatingChange(i + 1)}>
//                   <Ionicons
//                     name={i < rating ? 'star' : 'star-outline'}
//                     size={24}
//                     color="#FFD700"
//                   />
//                 </TouchableOpacity>
//               ))}
//               <Pressable
//                 onPress={() => handleSubmit(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, messageId, rating)}
//                 disabled={rating === 0}
//                 style={[
//                   styles.submitButton,
//                   { opacity: rating === 0 ? 0.5 : 1 },
//                 ]}
//               >
//                 <MaterialCommunityIcons name="check" size={25} color="white" />
//               </Pressable>
//             </View>
//           )}

//           {/* Show confirmation once submitted */}
//           {submitted && (
//             <View style={styles.feedbackSubmitted}>
//               <MaterialCommunityIcons
//                 name="check-circle"
//                 size={22}
//                 color="#4CAF50"
//               />
//             </View>
//           )}
//       </>
//       )}
//     </View>
//   );
// };

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
        paddingBottom: 5,
    },

    chatText: {
        color: "white",
    },

    chatTextUser: {
        color: "#fff",
    },

    speakerIcon: {
        position: "absolute",
        right: 8,
        top: 8,
    },

    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: 8,
      paddingTop: 5,
      borderTopWidth: 1,
      borderTopColor: '#555555',
      gap: 4,
    },
    
    submitButton: {
      backgroundColor: '#007AFF',
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginLeft: 10,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    
    feedbackSubmitted: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingTop: 5,
      borderTopWidth: 1,
      borderTopColor: '#555555',
    },
    feedbackSubmittedText: {
      color: '#FFD700', // Gold
      fontSize: 12,
      marginLeft: 5,
    },
    errorText: {
        color: '#FF6B6B', // Light red for error
        fontSize: 12,
        marginTop: 5,
    }
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

