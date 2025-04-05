import { View, Text, StyleSheet, Button, FlatList, KeyboardAvoidingView, VirtualizedList } from 'react-native'
import { useState } from 'react'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import { Pressable, ScrollView, TextInput } from 'react-native-gesture-handler'
import { SelectCountry } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { NavigationProp } from '@react-navigation/native'
import { TASK_AGENT_URL } from '@/constants'
import axios from 'axios';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const category = [
    {
      value: '1',
      label: 'Personal',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: '2',
      label: 'Work',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: '3',
      label: 'Shopping',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: '4',
      label: 'Health',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: '5',
      label: 'Other',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
  ];
const priority = [
    {
      value: '1',
      label: 'Low',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: '2',
      label: 'Medium',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
    {
      value: '3',
      label: 'High',
      image: {
        uri: "https://www.vigcenter.com/public/all/images/default-image.jpg"
      }
    },
  ];

const Inside_Task = ({ route, navigation }) => {
    var { INtaskId, INtaskName, INtaskDescription, INtaskCategory, INtaskPriority, INtaskDate, INtaskTime, INsubTasks } = route.params;
    const [taskId, setTaskId] = useState(INtaskId);
    const [taskName, setTaskName] = useState(INtaskName);
    const [taskDescription, setTaskDescription] = useState(INtaskDescription);
    const [categoryNo, setCategoryNo] = useState(INtaskCategory);
    const [priorityNo, setPriorityNo] = useState(INtaskPriority);
    const [date, setDate] = useState(INtaskDate);
    const [time, setTime] = useState(INtaskTime);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [subTask, setSubTask] = useState(INsubTasks);
    const [subTaskText, setSubTaskText] = useState('');
    const [taskAIText, setTaskAIText] = useState('');

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
        console.log(date);
    }

    const task_agent = async () => {
      console.log(taskAIText)
      const response = await axios.get(`${TASK_AGENT_URL}/${taskAIText}`);
      console.log(response.data);
      var AIResponse = response.data;
      // if (response.data) {
      //   setTaskAITextResponse(response.data);
      //   console.log(typeof(taskAITextResponse))
      // } else {
      //   console.log('No response from AI agent');
      // }
      try {
        setTaskName(AIResponse['taskName']);
        setTaskDescription(AIResponse['taskDescription']);
        setCategoryNo(AIResponse['taskCategory']);
        setPriorityNo(AIResponse['taskPriority']);
        setSubTask(AIResponse['subTasks']);
      } catch (error) {
          console.error("Invalid JSON format:", error);
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
                    <MaterialCommunityIcons name="send" size={25} color='white'/>
                  </Pressable>
                </View>      
              </View>
            )}
            
            <View style={styles.title}>
                <Text style={{fontSize: 18, fontWeight: 'bold'}}>Task</Text>
                <TextInput style={{backgroundColor:'white', borderRadius: 10}} placeholder='What do you need to do' value={taskName} />
            </View>
            <View style={styles.description}>
                <Text style={{fontSize: 18, fontWeight: 'bold', paddingBottom: 5}}>Description</Text>
                <TextInput style={{backgroundColor:'white', height: 70, borderRadius: 10}} value={taskDescription} />
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
                        value={categoryNo}
                        data={category}
                        valueField="value"
                        labelField="label"
                        imageField="image"
                        placeholder="Select Category"
                        searchPlaceholder="Search..."
                        onChange={e => {
                        setCategoryNo(e.value);
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
                        value={priorityNo}
                        data={priority}
                        valueField="value"
                        labelField="label"
                        imageField="image"
                        placeholder="Select Category"
                        searchPlaceholder="Search..."
                        onChange={e => {
                        setPriorityNo(e.value);
                        }}
                    />
                </View>
            </View>
            
            <View style={styles.subTasks}>
                <Text style={{fontSize: 18, fontWeight: 'bold', paddingBottom: 5 }}>SubTasks</Text>
                <View style={{flexDirection: 'column', maxHeight: 200}}>
                  <ScrollView>
                    {subTask.map((item, index) => (
                      <View key={index} style={{ padding: 10, borderBottomWidth: 1 }}>
                        <Text>{'•'} {item.key}</Text>
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
                
                <Pressable style={styles.submitButton} onPress={() => console.log('submit')}>
                    <Text style={{color: 'white', fontSize: 18}}>Add Task</Text>
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