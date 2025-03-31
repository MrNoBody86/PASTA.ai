import { View, Text, StyleSheet ,SafeAreaView, Pressable } from 'react-native'
import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Task_Manager = ({ navigation, route } : RouterProps) => {
    const [isChecked, setIsChecked] = useState(true);
    const iconName = isChecked ? 'checkbox-marked' : 'checkbox-blank-outline';
    
    const taskDetails = [{
      'taskId': '001',
      'taskName': 'MyTask',
      'taskDescription': 'Task Description',
      'taskCategory': 'Personal',
      'taskPriority': 'Medium',
      'taskDate': new Date(),
      'taskTime': new Date(),
      'subTasks': [{'key': 'subTask1'}, {'key': 'subTask2'}]
    }, {
      'taskId': '002',
      'taskName': 'Do code',
      'taskDescription': 'Task Description',
      'taskCategory': 'Personal',
      'taskPriority': 'Medium',
      'taskDate': new Date(),
      'taskTime': new Date(),
      'subTasks': [{'key': 'subTask1'}, {'key': 'subTask2'}]
    }, {
      'taskId': '003',
      'taskName': 'Get shit done',
      'taskDescription': 'Task Description',
      'taskCategory': 'Personal',
      'taskPriority': 'Medium',
      'taskDate': new Date(),
      'taskTime': new Date(),
      'subTasks': [{'key': 'subTask1'}, {'key': 'subTask2'}]
    },]
    
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Tasks</Text>
      <ScrollView style={styles.taskRows}>
      {taskDetails.map((item, index) => (
        <View style={styles.taskContainer}>
        <Pressable style={styles.checkbox} onPress={() => setIsChecked(!isChecked)}>
            <MaterialCommunityIcons name={iconName} size={25} color="black" />
        </Pressable>
        <View style={{paddingLeft: 10}}>
            <Text style={styles.taskTitle}>{item.taskName}</Text>
            <View style={styles.taskDetails}>
                <Text style={styles.date}>{item.taskDate.toLocaleDateString()}</Text>
                <Text>{item.taskCategory}</Text>
                <Text>{item.taskPriority}</Text>
            </View>
        </View>

        <Pressable style={styles.viewTaskButton}  onPress={() => {navigation.navigate('TaskView', {
          taskName: item.taskName,
          taskDescription: item.taskDescription,
          taskCategory: item.taskCategory,
          taskPriority: item.taskPriority,
          taskDate: item.taskDate,
          taskTime: item.taskTime,
          subTasks: item.subTasks
        })}}>
          <View style={styles.viewTask}>
              <MaterialCommunityIcons name='clipboard-outline' size={30} color="black"/>
          </View>
        </Pressable>
        
        <Pressable style={styles.deleteTaskButton}>
          <View style={styles.deleteTask}>
              <MaterialCommunityIcons name="delete-outline" size={25} color="black"/>
          </View>
        </Pressable>

      </View>
      ))}
      </ScrollView>
      <View style={styles.addTask}>
        <Pressable style={styles.addTaskButton} onPress={() => {navigation.navigate('TaskView', {
          taskId: 'new',
          taskName: 'MyTasks',
          taskDescription: 'Task Description',
          taskCategory: '1',
          taskPriority: '2',
          taskDate: new Date(),
          taskTime: new Date(),
          subTasks: [{'key': 'subTask1'}, {'key': 'subTask2'}]
        })}}>
            <MaterialCommunityIcons name="plus" size={25} color='black'/>
        </Pressable>
      </View>

    </SafeAreaView>

    
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingBottom: 10,
    },
    taskRows:{
      height: '82%'
    },
    taskContainer: {
        height: 85,
        backgroundColor: '#fff',
        borderRadius: 20,
        flexDirection: 'row',
        gap: 5,
        marginTop: 10
    },
    taskTitle: {
        fontSize: 18,
        marginTop: 15,
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
        paddingLeft: 12
    },
    addTask: {
        position: 'absolute',
        bottom: -53,
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