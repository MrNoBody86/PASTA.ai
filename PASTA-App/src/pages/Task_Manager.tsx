import { View, Text, StyleSheet ,SafeAreaView, Pressable, ActivityIndicator } from 'react-native'
import { useEffect, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler'
import { NavigationProp } from '@react-navigation/native'
import { collection, query, orderBy, getDocs, limit, addDoc, serverTimestamp, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from '@/FirebaseConfig'

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Task_Manager = ({ navigation, route } : RouterProps) => {
    const [checkedTasks, setCheckedTasks] = useState<{ [key: string]: boolean }>({});
    const [allTasks, setAllTasks] = useState([]);
    const [screenLoading, setScreenLoading] = useState(true);

    const getPriorityColor = (priority: string) => {
      switch (priority.toLowerCase()) {
        case 'high':
          return '#FF6B6B';
        case 'medium':
          return '#FFA500';
        case 'low':
          return '#4CAF50';
        default:
          return '#CCCCCC';
      }
    };

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
            const initialCheckboxes = {};
            fetchedTasks.forEach(task => {
              initialCheckboxes[task.taskId] = task.completed;
            });
            setCheckedTasks(initialCheckboxes);
            setAllTasks(fetchedTasks);
            setScreenLoading(false);
        }

    useEffect(() => {
      if (FIREBASE_AUTH.currentUser?.uid) {
        getTaskDetailsFromFireBase(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
      }
    }, []);

    const toggleCheckbox = async (taskId: string) => {
      const newStatus = !checkedTasks[taskId];
      // Update local state
      setCheckedTasks((prev) => ({
        ...prev,
        [taskId]: newStatus,
      }));

      try {
        const userUid = FIREBASE_AUTH.currentUser?.uid;
        if (!userUid) return;

        const taskRef = doc(FIREBASE_DB, "users", userUid, "tasks", taskId);
        await updateDoc(taskRef, {
          completed: newStatus,
        });
      } catch (error) {
        console.error("Error updating task status:", error);
      }

    };
    

    const deleteTaskFromFirebase = async (taskId, taskIndex) => {
      try {
        const userUid = FIREBASE_AUTH.currentUser?.uid;
        if (!userUid) throw new Error("User not authenticated");

        const taskRef = doc(FIREBASE_DB, "users", userUid, "tasks", taskId);
        await deleteDoc(taskRef);

        // Remove the task from local state
        setAllTasks(prev => prev.filter(task => task.taskId !== taskId));
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
    
  return (
    screenLoading ? (
      <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <ActivityIndicator size="large" color="#004643" />
        <Text style={{marginTop: 10, fontWeight: "600"}}>Loading...</Text>
      </View>
    ) : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Tasks</Text>

      {allTasks.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: 'gray' }}>No tasks created</Text>
        </View>
      ) : (
        <ScrollView style={styles.taskRows}>
          {allTasks.map((item, index) => {
            const isChecked = checkedTasks[item.taskId] || false;
            const iconName = isChecked ? 'checkbox-marked' : 'checkbox-blank-outline';
            return (
              <View key={index} style={styles.taskContainer}>
                <Pressable style={styles.checkbox} onPress={() => toggleCheckbox(item.taskId)}>
                  <MaterialCommunityIcons name={iconName} size={25} color="black" />
                </Pressable>
                <View style={{ paddingLeft: 10, width: '53%' }}>
                  <Text
                    style={[
                      styles.taskTitle,
                      isChecked && { textDecorationLine: 'line-through', color: 'gray' },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.taskName}
                  </Text>
                  <View style={styles.taskDetails}>
                    <Text style={styles.date}>{item.taskDate.toLocaleDateString()}</Text>
                    <Text style={{backgroundColor: '#d0ebff', color: '#1c7ed6', borderRadius: 10, padding: 4, fontSize: 13}}>{item.taskCategory}</Text>
                    <Text style={{ backgroundColor: getPriorityColor(item.taskPriority), color: 'white', borderRadius: 10, padding: 4, fontSize: 13 }}>{item.taskPriority}</Text>
                  </View>
                </View>

                <Pressable
                  style={styles.viewTaskButton}
                  onPress={() => {
                    navigation.navigate('TaskView', {
                      INtaskId: item.taskId,
                      INtaskName: item.taskName,
                      INtaskDescription: item.taskDescription,
                      INtaskCategory: item.taskCategory,
                      INtaskPriority: item.taskPriority,
                      INtaskDate: item.taskDate,
                      INtaskTime: item.taskTime,
                      INsubTasks: item.subTasks,
                      INcompleted: item.completed,
                      INtimestamp: item.timestamp,
                    });
                  }}
                >
                  <View style={styles.viewTask}>
                    <MaterialCommunityIcons name="clipboard-outline" size={30} color="black" />
                  </View>
                </Pressable>

                <Pressable
                  style={styles.deleteTaskButton}
                  onPress={() => deleteTaskFromFirebase(item.taskId, index)}
                >
                  <View style={styles.deleteTask}>
                    <MaterialCommunityIcons name="delete-outline" size={25} color="black" />
                  </View>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.addTask}>
        <Pressable
          style={styles.addTaskButton}
          onPress={() => {
            navigation.navigate('TaskView', {
              INtaskId: '',
              INtaskName: '',
              INtaskDescription: '',
              INtaskCategory: 'Personal',
              INtaskPriority: 'Medium',
              INtaskDate: new Date(),
              INtaskTime: new Date(),
              INsubTasks: [],
              INcompleted: false,
              INtimestamp: serverTimestamp(),
            });
          }}
        >
          <MaterialCommunityIcons name="plus" size={25} color="black" />
        </Pressable>
      </View>
    </SafeAreaView>
    )
    

    
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingBottom: 10,
    },
    taskRows:{
      flex: 1,
      marginBottom: 80,
    },
    taskContainer: {
        height: 95,
        backgroundColor: '#fff',
        borderRadius: 20,
        flexDirection: 'row',
        gap: 5,
        marginTop: 10,
        elevation: 5,
    },
    taskTitle: {
        fontSize: 18,
        marginTop: 15,
        fontWeight: 'bold',
    },
    taskDetails:{
        flexDirection: 'row',
        marginTop: 10,
        gap: 10
    },
    viewTask: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteTask: {
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center'
    },
    viewTaskButton: {
        width: 45, 
        height: 45, 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 'auto', 
        borderRadius: 20,
        marginLeft: 20,
    },
    deleteTaskButton: {
        width: 30, 
        height: 30, 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 'auto', 
        borderRadius: 20,
    },
    checkbox: {
        marginTop: 'auto',
        marginBottom: 'auto',
        paddingLeft: 12,
    },
    addTask: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    addTaskButton: {
      borderRadius: 30,
      height: 60,
      width: 60,
      justifyContent: 'center',
      alignItems: 'center',
    }
})

export default Task_Manager