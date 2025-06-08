import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { TextInput, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import ProgressBar from 'react-native-progress/Bar';
import React, { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/FirebaseConfig';
import { collection, addDoc, serverTimestamp, orderBy, query, getDocs, limit } from 'firebase/firestore';
import { getCurrentGoogleUser, fetchGoogleFitData } from '@/src/services/GoogleApiService';
import { Scroll } from 'lucide-react-native';

// Helper to parse Google Fit API response
const parseFitData = (fitApiResponse: any) => {
    let steps = 0;
    let calories = 0;
    let distance = 0;

    if (fitApiResponse && fitApiResponse.bucket) {
        fitApiResponse.bucket.forEach((bucket: any) => {
        bucket.dataset.forEach((dataset: any) => {
            dataset.point.forEach((point: any) => {
            if (point.value && point.value.length > 0) {
                if (dataset.dataSourceId.includes("step_count")) {
                    steps += point.value[0].intVal || 0;
                } else if (dataset.dataSourceId.includes("calories.expended")) {
                    calories += point.value[0].fpVal || 0;
                } else if (dataset.dataSourceId.includes("distance")) {
                    distance += point.value[0].fpVal || 0;
                }
            }
            });
        });
        });
    }
    return {
        steps,
        calories: Math.round(calories),
        distance: parseFloat((distance / 1000).toFixed(2)), // meters to km
    };
};

const Dashboard = () => {

  const [scoreEXT, setEXT] = useState(0);
  const [scoreAGG, setAGG] = useState(0);
  const [scoreCON, setCON] = useState(0);
  const [scoreNEU, setNEU] = useState(0);
  const [scoreOPE, setOPE] = useState(0);
  const [personalityScore, setPersonalityScore] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [allActivities, setAllActivities] = useState([]);
  const [pLoading, setPLoading] = useState(true);
  const [TLoading, setTLoading] = useState(true);
  const [ALoading, setALoading] = useState(true);

  const [googleFitStats, setGoogleFitStats] = useState<{steps: number, calories: number, distance: number} | null>(null);
  const [isGoogleFitLoading, setIsGoogleFitLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return '#fa5252'; // red
      case 'medium':
        return '#fab005'; // orange
      case 'low':
        return '#40c057'; // green
      default:
        return '#adb5bd'; // grey
    }
  };

  // Function to fetch overall personality scores from Firebase
  async function getPersonalityScores(db, userId){
      const messagesRef = collection(db, "users", userId, "personalityScores");
      const querySnapshot = await getDocs(messagesRef);
      const personalityScores = [];

      querySnapshot.forEach((doc) => {
        // console.log("Document  => ", doc.data());
        const messageData = {
          id: doc.id,
          scoreEXT: doc.data().scoreEXT,
          scoreAGG: doc.data().scoreAGG,
          scoreCON: doc.data().scoreCON,
          scoreNEU: doc.data().scoreNEU,
          scoreOPE: doc.data().scoreOPE,
            // timestamp: doc.data().timestamp,
        }
        personalityScores.push(messageData);
      });

      if (personalityScores.length > 0) {
        const latest = personalityScores[0];
        setEXT(latest["scoreEXT"]);
        setAGG(latest["scoreAGG"]);
        setCON(latest["scoreCON"]);
        setNEU(latest["scoreNEU"]);
        setOPE(latest["scoreOPE"]);
      }

      setPersonalityScore(personalityScores);
      setPLoading(false);
  }

  async function getTaskDetailsFromFireBase(db, userUid, messageLimit) {
      const messagesRef = collection(db, "users", userUid, "tasks");
      const q = query(
          messagesRef,
          orderBy("timestamp", "asc"),
          limit(messageLimit)
      );
      const querySnapshot = await getDocs(q);
      const fetchedTasks = [];
      querySnapshot.forEach((doc) => {
          const taskData = {
              taskId: doc.id,
              taskName: doc.data().taskName,
              taskDescription: doc.data().taskDescription,
              taskCategory: doc.data().taskCategory,
              taskPriority: doc.data().taskPriority,
              taskDate: doc.data().taskDate.toDate(),
              taskTime: doc.data().taskTime.toDate(),
              subTasks: doc.data().subTasks,
              completed: doc.data().completed,
              timestamp: doc.data().timestamp.toDate(),
          };
          fetchedTasks.push(taskData);
      });
      console.log("Fetched Tasks: ", fetchedTasks);
      const completedTasks = fetchedTasks.filter(task => task.completed === false);
      setAllTasks(completedTasks);
      setTLoading(false);
  }

  async function getActivitiesFromFireBase(db, userUid, messageLimit) {
        const messagesRef = collection(db, "users", userUid, "activities");
        const q = query(
            messagesRef,
            orderBy("timestamp", "asc"),
            limit(messageLimit)
        );
        const querySnapshot = await getDocs(q);
        const fetchedActivities = [];
        querySnapshot.forEach((doc) => {
            const ActivityData = {
                ActivityId: doc.id,
                ActivityTitle: doc.data().ActivityTitle,
                ActivityType: doc.data().ActivityType,
                StartDate: doc.data().StartDate.toDate(),
                StartTime: doc.data().StartTime.toDate(),
                Duration: doc.data().Duration.toDate(),
                Distance: doc.data().Distance,
                Calories: doc.data().Calories,
                Steps: doc.data().Steps,
                ActivityDescription: doc.data().ActivityDescription,
                timestamp: doc.data().timestamp.toDate(),
            };
            fetchedActivities.push(ActivityData);
        });
        setAllActivities(fetchedActivities);
        setALoading(false);
    }

  useEffect(() => {
      const loadInitialData = async () => {
        await getPersonalityScores(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid);
        await getTaskDetailsFromFireBase(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, 10);
        await getActivitiesFromFireBase(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, 10);
      };
      loadInitialData();
      const loadGoogleFit = async () => {
      setIsGoogleFitLoading(true);
      const googleAuth = await getCurrentGoogleUser();
      if (googleAuth && googleAuth.accessToken) {
        try {
          const now = new Date();
          const startTime = new Date(now);
          startTime.setHours(0, 0, 0, 0); // Start of today
          const endTime = new Date(now);
          endTime.setHours(23, 59, 59, 999); // End of today
          const rawData = await fetchGoogleFitData(googleAuth.accessToken, startTime.getTime(), endTime.getTime());
          setGoogleFitStats(parseFitData(rawData));
        } catch (e) {
          console.warn("Dashboard: Failed to fetch Google Fit data", e);
          setGoogleFitStats(null); // Clear on error
        }
      }
      setIsGoogleFitLoading(false);
    };
    loadGoogleFit();
  }, []);

  return (
    <SafeAreaProvider>
      <ScrollView>
      <SafeAreaView style={styles.container}>
        <Text style={styles.titleText}>Welcome to Pasta.ai</Text>
        <View style={styles.personalityBoard}>
            <Text style={{fontWeight: 'bold', fontSize: 19, paddingBottom: 5}}>Your Personality Score 🧠</Text>
            {pLoading ? (
              <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
            ) : (
              !scoreEXT ? (
                <Text style={{textAlign: 'center', color: '#888', marginTop: 15 }}>No Personality Data Available</Text>
              ) : (
              <>
              <View style={styles.personalityBar}>
                <Text>Extraversion</Text>
                <ProgressBar progress={scoreEXT/40} width={screenWidth*0.45} height={10} animated={true} color="rgba(255, 140, 0, 1)"/>
              </View>
              <View style={styles.personalityBar}>
                <Text>Agreeableness</Text>
                <ProgressBar progress={scoreAGG/40} width={screenWidth*0.45} height={10} animated={true} color="rgba(60, 179, 113, 1)"/>
              </View>
              <View style={styles.personalityBar}>
                <Text>Conscientiousness</Text>
                <ProgressBar progress={scoreCON/40} width={screenWidth*0.45} height={10} animated={true} color="rgba(0, 122, 204, 1)"/>
              </View>
              <View style={styles.personalityBar}>
                <Text>Neuroticism</Text>
                <ProgressBar progress={scoreNEU/40} width={screenWidth*0.45} height={10} animated={true} color="rgba(220, 20, 60, 1)"/>
              </View>
              <View style={styles.personalityBar}>
                <Text>Openness</Text>
                <ProgressBar progress={scoreOPE/40} width={screenWidth*0.45} height={10} animated={true} color="rgba(138, 43, 226, 1)"/>
              </View>
            </>
              )
            
            )}
            
        </View>

        {/* Google Fit Stats Section Example */}
        <View style={styles.googleFitBoard}>
          <Text style={{fontWeight: 'bold', fontSize: 19, paddingBottom: 5}}>Today's Google Fit Stats 🏃‍♂️</Text>
          {isGoogleFitLoading ? (
            <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
          ) : googleFitStats ? (
            <>
              <Text>Steps: {googleFitStats.steps}</Text>
              <Text>Calories Burned: {googleFitStats.calories}</Text>
              <Text>Distance: {googleFitStats.distance} km</Text>
            </>
          ) : (
            <Text style={{textAlign: 'center', color: '#888', marginTop: 15 }}>
              Connect Google Fit via 'Google Sync' page to see stats.
            </Text>
          )}
        </View>

        <View style={styles.taskBoard}>
          <Text style={{fontSize: 19, fontWeight: 'bold'}}>Remaining Tasks 📋</Text>
          {TLoading ? (
            <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
          ) : (
            <ScrollView>
              {allTasks.length > 0 ? (
                allTasks.map((task, index) => (
                  <View key={task.taskId} style={styles.card}>
                    <Text style={styles.cardTitle}>{index + 1}. {task.taskName}</Text>
                    <View style={styles.tagRow}>
                      <Text style={styles.tag}>{task.taskCategory}</Text>
                      <Text style={[styles.priorityTag, { backgroundColor: getPriorityColor(task.taskPriority) }]}>
                        {task.taskPriority}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoText}><Text style={{fontWeight: 'bold'}}>Date:</Text> {task.taskDate.toLocaleDateString()}</Text>
                      <Text style={styles.infoText}><Text style={{fontWeight: 'bold'}}>Time:</Text> {task.taskTime.toLocaleTimeString()}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{textAlign: 'center', color: '#888', marginTop: 15 }}>All Tasks Completed</Text>
              )}
            </ScrollView>
          )}
          
        </View>

        <View style={styles.activityBoard}>
          <Text style={{fontSize: 19, fontWeight: 'bold'}}>Your Activities 🏋</Text>
          {ALoading ? (
            <ActivityIndicator size="large" color="#0000ff" style={{marginTop: 20}} />
          ) : (
            <ScrollView>
              {allActivities.length > 0 ? (
                allActivities.map((activity, index) => (
                  <View key={activity.ActivityId} style={styles.card}>
                    <Text style={styles.cardTitle}>{index + 1}. {activity.ActivityTitle}</Text>
                    <Text style={[styles.infoText, { paddingLeft: 20, marginBottom: 5}]}>Type: {activity.ActivityType}</Text>
                    <View style={[styles.infoRow, { marginBottom: 5 }]}>
                      <Text style={styles.infoText}><Text style={{fontWeight: 'bold'}}>Date:</Text> {activity.StartDate.toLocaleDateString()}</Text>
                      <Text style={styles.infoText}><Text style={{fontWeight: 'bold'}}>Time:</Text> {activity.StartTime.toLocaleTimeString()}</Text>
                    </View>
                    <Text style={[styles.infoText, { paddingLeft: 20}]}><Text style={{fontWeight: 'bold'}}>Duration:</Text> {`${activity.Duration.getHours().toString()}h ${activity.Duration.getMinutes().toString().padStart(2, '0')}m`}</Text>
                  </View>
                ))
              ) : (
                <Text style={{textAlign: 'center', color: '#888', marginTop: 15 }}>No Recent Activities</Text>
              )}
            </ScrollView>
          )}
          
        </View>
      </SafeAreaView>
      </ScrollView>
    </SafeAreaProvider>
    
  )
}

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  personalityBoard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 195,
  },
  personalityBar: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 5, 
    alignItems: 'center',
  },
  taskBoard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 200,
    minHeight: 100,
  },
  activityBoard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: 200,
    minHeight: 100,
  },
  card: {
    backgroundColor: '#fefefe',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
    paddingLeft: 15,
  },
  tag: {
    backgroundColor: '#d0ebff',
    color: '#1c7ed6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    overflow: 'hidden',
  },
  priorityTag: {
    color: 'white',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#444',
  },
  googleFitBoard: {
  marginTop: 20,
  padding: 16,
  backgroundColor: '#fff',
  borderRadius: 10,
  minHeight: 100,
  }
})