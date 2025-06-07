import { View, Text, StyleSheet, Button, FlatList, KeyboardAvoidingView, VirtualizedList, ActivityIndicator } from 'react-native'
import { useState } from 'react'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { Pressable, ScrollView, TextInput } from 'react-native-gesture-handler'
import { SelectCountry } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { NavigationProp } from '@react-navigation/native'
import { TASK_AGENT_URL, SET_USER_ID } from '@/constants'
import { FIREBASE_DB, FIREBASE_AUTH } from '@/FirebaseConfig';
import { collection, query, orderBy, getDocs, limit, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import axios from 'axios';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const CATEGORY = [
    {
      value: 'Personal',
      label: 'Personal',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: 'Work',
      label: 'Work',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: 'Shopping',
      label: 'Shopping',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: 'Health',
      label: 'Health',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: 'Other',
      label: 'Other',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
  ];
const PRIORITY = [
    {
      value: 'Low',
      label: 'Low',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: 'Medium',
      label: 'Medium',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: 'High',
      label: 'High',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
  ];

const Inside_Task = ({ route, navigation }) => {
    var { INtaskId, INtaskName, INtaskDescription, INtaskCategory, INtaskPriority, INtaskDate, INtaskTime, INsubTasks, INcompleted, INtimestamp } = route.params;
    const [taskId, setTaskId] = useState(INtaskId);
    const [taskName, setTaskName] = useState(INtaskName);
    const [taskDescription, setTaskDescription] = useState(INtaskDescription);
    const [category, setCategory] = useState(INtaskCategory);
    const [priority, setPriority] = useState(INtaskPriority);
    const [date, setDate] = useState(INtaskDate);
    const [time, setTime] = useState(INtaskTime);
    const [completed, setCompleted] = useState(INcompleted);
    const [timestamp, setTimestamp] = useState(INtimestamp);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [subTask, setSubTask] = useState(INsubTasks);
    const [subTaskText, setSubTaskText] = useState('');
    const [taskAIText, setTaskAIText] = useState('');
    const [isLoadingAI, setIsLoadingAI] = useState(false); // For loading indicator

    const onChangeDate = (e, selectedDate) => {
        setDate(selectedDate);
        setShowDate(false);
    }
    const onChangeTime = (e, selectedDate) => {
        setTime(selectedDate);
        setShowTime(false);
    }

    const showDatePicker = () => {
        setShowDate(true);
        setShowTime(false);
    }

    const showTimePicker = () => {
        setShowTime(true);
        setShowDate(false);
    }

    const addSubTasks = (title) => {
        //If the subTaskText is empty, do not add it to the list
        if (title.trim() === '') return;
        setSubTask([...subTask, {'key': title}]);
        setSubTaskText('');
        console.log(subTask); 
    }

    const deleteSubTask  = (index) => {
        const newSubTasks = subTask.filter((_, i) => i !== index);
        setSubTask(newSubTasks);
        console.log(newSubTasks);
    }

    async function addTaskToFireBase(db, userUid, taskName, taskDescription, taskCategory, taskPriority, taskDate, taskTime, subTasks) {
      if (!userUid) {
        console.error("Error adding task: User not authenticated.");
        return;
      }
      try {
          const messagesRef = collection(db, "users", userUid, "tasks");
          const newMessage = {
              taskName: taskName,
              taskDescription: taskDescription,
              taskCategory: taskCategory,
              taskPriority: taskPriority,
              taskDate: taskDate,
              taskTime: taskTime,
              subTasks: subTasks,
              completed: false,
              timestamp: serverTimestamp(),
          };
          const docRef = await addDoc(messagesRef, newMessage);
          console.log("Document written with ID: ", docRef.id);
          navigation.navigate('Task')
          return docRef;
        } catch (e) {
          console.error("Error adding document: ", e);
          throw e;
        }
    }

    async function updateTaskInFirebase(db, userUid, taskId, updatedTask) {
      if (!userUid || !taskId) {
        console.error("Error updating task: User not authenticated or Task ID missing.");
        return;
      }
      try {
        const taskRef = doc(db, "users", userUid, "tasks", taskId);
        // We don't want to overwrite the original creation timestamp when updating
        const { timestamp: originalTimestamp, ...taskDataToUpdate } = updatedTask; 
        await updateDoc(taskRef, {
          ...taskDataToUpdate,
            lastUpdated: serverTimestamp(), // Add a last updated timestamp
        });
        console.log("Task updated successfully: ", taskId);
        navigation.navigate('Task'); // or show confirmation
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }

    const handleSaveTask = () => {
      const currentUserID = FIREBASE_AUTH.currentUser?.uid;
      if (!currentUserID) {
          console.error("Cannot save task: User not authenticated.");
          // Show error to user
          return;
      }
      const taskData = {
        taskName: taskName,
        taskDescription: taskDescription,
        taskCategory: category,
        taskPriority: priority,
        taskDate: date,
        taskTime: time,
        subTasks: subTask,
        completed: completed,
      };

      if(taskId) {
        updateTaskInFirebase(FIREBASE_DB, currentUserID, taskId, taskData);
      } else {
        addTaskToFireBase(FIREBASE_DB, currentUserID, taskName, taskDescription, category, priority, date, time, subTask);
      }
    }

    const task_agent = async () => {
      const currentUser = FIREBASE_AUTH.currentUser;
      if(!currentUser){
        console.error("Task Agent: User not authenticated");
        return;
      }
      if(!taskAIText.trim()) {
        console.warn("Task Agent: Input text to task agent is empty");
        return;
      }

      setIsLoadingAI(true);
      console.log("Task Agent AI text input: ", taskAIText, "for UserID: ", currentUser.uid);
      try {
        const idToken = await currentUser.getIdToken();

        const response = await axios.get(
          `${TASK_AGENT_URL}/${encodeURIComponent(taskAIText)}`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`,
            }
          }
        );
        console.log("Task Agent API Response:", response.data);
        
        const AIResponse = response.data;
        if (AIResponse.error) {
          console.error("Task Agent Error from backend:", AIResponse.error);
          // Display error to user (e.g., using a state variable and a Text component)
          // alert(`AI Error: ${AIResponse.error}`); // Simple alert for now
          return;
        }

        // Update state with AI suggestions, providing fallbacks to current values
          setTaskName(AIResponse?.taskName || taskName);
          setTaskDescription(AIResponse?.taskDescription || taskDescription);
          setCategory(AIResponse?.taskCategory || category);
          setPriority(AIResponse?.taskPriority || priority);
          if (AIResponse?.subTasks && Array.isArray(AIResponse.subTasks)) {
            setSubTask(AIResponse.subTasks);
        } else if (AIResponse?.subTasks) { // Handle if it's not an array but exists
            console.warn("AI returned subTasks but not in expected array format:", AIResponse.subTasks);
        }
      } catch (error: any) {
        console.error("Error calling Task Agent API:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("API Error Data:", error.response.data);
            console.error("API Error Status:", error.response.status);
            // alert(`API Error: ${error.response.data.error || error.message}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("API No Response:", error.request);
            // alert("API Error: No response from server.");
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error("API Request Setup Error:", error.message);
            // alert(`API Error: ${error.message}`);
        }
      } finally {
          setIsLoadingAI(false);
      }
    }

    return (
      <ScrollView>
        <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
            {!taskId && (
              <View>
                <Text style={{fontSize: 16, fontWeight: 'bold'}}>AI Box</Text>
                <View style={{flexDirection: 'row', gap: 10}}>
                  <TextInput style={{backgroundColor: 'white', borderRadius: 10, width: '90%'}} placeholder='Auto-fill your task Details' onChangeText={setTaskAIText} value={taskAIText}></TextInput>
                  <Pressable style={{backgroundColor: 'black', borderRadius: 10, width: 40, height: 40, alignItems: 'center', justifyContent: 'center'}} onPress={task_agent}>
                  {isLoadingAI ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <MaterialCommunityIcons name="send" size={20} color='white'/>
                    )}
                  </Pressable>
                </View>      
              </View>
            )}

            
            
            <View style={styles.title}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>Task</Text>
                <TextInput style={{backgroundColor:'white', borderRadius: 10}} placeholder='What do you need to do' value={taskName} onChangeText={setTaskName} />
            </View>
            <View style={styles.description}>
                <Text style={{fontSize: 18, fontWeight: 'bold', paddingBottom: 5}}>Description</Text>
                <TextInput style={{backgroundColor:'white', height: 70, borderRadius: 10}} value={taskDescription} onChangeText={setTaskDescription}/>
            </View> 
            <View style={styles.datetime}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>Date</Text>
                <Pressable style={styles.dateButton} onPress={() => showDatePicker()}>
                    <Text style={{fontSize: 16}}>{date.toLocaleDateString()}</Text>
                </Pressable>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>Time</Text>
                <Pressable style={styles.dateButton} onPress={() => showTimePicker()}>
                    <Text style={{fontSize: 16}}>{time.toLocaleTimeString()}</Text>
                </Pressable>
                {
                    showDate && (
                        <DateTimePicker
                        value={date}
                        mode={'date'}
                        is24Hour={false}
                        onChange={onChangeDate}
                />)}
                {
                    showTime && (
                        <DateTimePicker
                        value={time}
                        mode={'time'}
                        is24Hour={false}
                        onChange={onChangeTime}
                />)}
            </View>
            <View style={styles.dropdownSelect}>
                <View>
                    <Text style={{fontSize:18, paddingBottom: 5, fontWeight: 'bold'}}>Select Category</Text>
                    <SelectCountry
                        style={styles.dropdown}
                        selectedTextStyle={styles.selectedTextStyle}
                        placeholderStyle={styles.placeholderStyle}
                        imageStyle={styles.imageStyle}
                        iconStyle={styles.iconStyle}
                        maxHeight={200}
                        value={category}
                        data={CATEGORY}
                        valueField="value"
                        labelField="label"
                        imageField="image"
                        placeholder="Select Category"
                        searchPlaceholder="Search..."
                        onChange={e => {
                        setCategory(e.value);
                        }}
                    />
                </View>
                <View>
                    <Text style={{fontSize:18, paddingBottom: 5, fontWeight: 'bold'}}>Select Priority</Text>
                    <SelectCountry
                        style={styles.dropdown}
                        selectedTextStyle={styles.selectedTextStyle}
                        placeholderStyle={styles.placeholderStyle}
                        imageStyle={styles.imageStyle}
                        iconStyle={styles.iconStyle}
                        maxHeight={200}
                        value={priority}
                        data={PRIORITY}
                        valueField="value"
                        labelField="label"
                        imageField="image"
                        placeholder="Select Category"
                        searchPlaceholder="Search..."
                        onChange={e => {
                        setPriority(e.value);
                        }}
                    />
                </View>
            </View>
            
            <View style={styles.subTasks}>
                <Text style={{fontSize: 18, fontWeight: 'bold', paddingBottom: 5 }}>SubTasks</Text>
                <View style={{flexDirection: 'column', maxHeight: 200}}>
                  <ScrollView>
                    {subTask.map((item, index) => (
                      <View key={index} style={{ padding: 10, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', position: 'relative'}}>
                        <Text>{'•'} {item.key}</Text>
                        <Pressable style={{position: 'absolute', right: 0, top: 0, padding: 10}} onPress={() => deleteSubTask(index)}>
                          <MaterialCommunityIcons name="delete-outline" size={20} color="black" />
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <KeyboardAvoidingView behavior='padding'>
                  <View style={{flexDirection: 'row'}}> 
                      <TextInput style={{backgroundColor: 'white', width: 250, borderRadius: 10}} value={subTaskText} onChangeText={setSubTaskText}/>
                      <Pressable style={styles.subTaskButton} onPress={() => addSubTasks(subTaskText)} >
                          <Text style={{color: 'white'}}>Add</Text>
                      </Pressable>
                  </View>
                </KeyboardAvoidingView>
                
                <Pressable style={styles.submitButton} onPress={() => handleSaveTask()}>
                    <Text style={{color: 'white', fontSize: 18}}>Save Task</Text>
                </Pressable>
            </View>
            
            
        </SafeAreaView>
      </SafeAreaProvider>
      </ScrollView>
      
        
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        maxHeight: 800
    },
    title: {
        flexDirection: 'column',
        gap: 5
    },
    description:{
        paddingTop: 10
    },
    datetime: {
        flexDirection: 'row',
        gap: 15,
        paddingTop: 20
    },
    dateButton:{
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'black',
        width: 110,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    dropdown: {
        margin: 0,
        height: 50,
        width: 150,
        backgroundColor: '#EEEEEE',
        borderRadius: 22,
        paddingHorizontal: 8,
      },
    imageStyle: {
        width: 24,
        height: 24,
        borderRadius: 12,
      },
    placeholderStyle: {
        fontSize: 16,
      },
    selectedTextStyle: {
        fontSize: 16,
        marginLeft: 8,
      },
    iconStyle: {
        width: 20,
        height: 20,
      },
    dropdownSelect: {
        paddingTop: 20,
        flexDirection: 'row',
        gap: 30
    },
    subTasks:{
        paddingTop: 20,
        flexDirection: 'column',
        gap: 10
    },
    subTaskButton:{
        backgroundColor: 'black',
        color: 'white',
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginLeft: 10,
    },
    submitButton:{
        flexDirection: 'row',
        backgroundColor: 'black',
        height: 50,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    }
})

export default Inside_Task