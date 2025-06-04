import { View, Text, StyleSheet } from 'react-native'
import { TextInput, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import ProgressBar from 'react-native-progress/Bar';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/FirebaseConfig';
import { collection, addDoc, serverTimestamp, orderBy, query, getDocs, limit } from 'firebase/firestore';
import React from 'react'

const Dashboard = () => {

  const [scoreEXT, setEXT] = useState(0);
  const [scoreAGG, setAGG] = useState(0);
  const [scoreCON, setCON] = useState(0);
  const [scoreNEU, setNEU] = useState(0);
  const [scoreOPE, setOPE] = useState(0);
  const [personalityScore, setPersonalityScore] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  const screenWidth = Dimensions.get('window').width;

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
      const completedTasks = fetchedTasks.filter(task => task.completed === true);
      setAllTasks(completedTasks);
  }

  useEffect(() => {
      if (FIREBASE_AUTH.currentUser?.uid) {
        getPersonalityScores(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid);
        getTaskDetailsFromFireBase(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, 10);
      }
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.titleText}>Welcome to Pasta.ai</Text>
        <View style={styles.personalityBoard}>
            <Text style={{fontWeight: 'bold', fontSize: 16}}>Your Personality Score</Text>
            <View style={styles.personalityBar}>
              <Text>Extraversion</Text>
              <ProgressBar progress={scoreEXT/40} width={screenWidth*0.5} height={10} animated={true} color="rgba(255, 140, 0, 1)"/>
            </View>
            <View style={styles.personalityBar}>
              <Text>Agreeableness</Text>
              <ProgressBar progress={scoreAGG/40} width={screenWidth*0.5} height={10} animated={true} color="rgba(60, 179, 113, 1)"/>
            </View>
            <View style={styles.personalityBar}>
              <Text>Conscientiousness</Text>
              <ProgressBar progress={scoreCON/40} width={screenWidth*0.5} height={10} animated={true} color="rgba(0, 122, 204, 1)"/>
            </View>
            <View style={styles.personalityBar}>
              <Text>Neuroticism</Text>
              <ProgressBar progress={scoreNEU/40} width={screenWidth*0.5} height={10} animated={true} color="rgba(220, 20, 60, 1)"/>
            </View>
            <View style={styles.personalityBar}>
              <Text>Openness</Text>
              <ProgressBar progress={scoreOPE/40} width={screenWidth*0.5} height={10} animated={true} color="rgba(138, 43, 226, 1)"/>
            </View>
        </View>

        <View style={styles.taskBoard}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>Remaining Tasks</Text>
          <ScrollView>
            {allTasks.length > 0 ? (
              allTasks.map((task, index) => (
                <View key={task.taskId} style={{marginVertical: 5}}>
                  <Text style={{fontWeight: 'bold'}}>{index + 1}. {task.taskName}</Text>
                  <Text>{task.taskDescription}</Text>
                  <Text>Category: {task.taskCategory}</Text>
                  <Text>Priority: {task.taskPriority}</Text>
                  <Text>Date: {task.taskDate.toLocaleDateString()}</Text>
                  <Text>Time: {task.taskTime.toLocaleTimeString()}</Text>
                </View>
              ))
            ) : (
              <Text style={{textAlign: 'center', color: '#888', marginTop: 15 }}>All Tasks Completed</Text>
            )}
          </ScrollView>
        </View>

        <View style={styles.activityBoard}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>Your Activities</Text>
          <Text style={{color: '#888', marginTop: 10}}>This section will show your recent activities.</Text>
          {/* Future implementation for activity board */}
        </View>
      </SafeAreaView>
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
    height: 195,
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
})