import { View, Text, StyleSheet ,SafeAreaView, Pressable } from 'react-native'
import { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { ScrollView } from 'react-native-gesture-handler'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const Task_Manager = ({ navigation } : RouterProps) => {
    const [isChecked, setIsChecked] = useState(true)
    const iconName = isChecked ? 'checkbox-marked' : 'checkbox-blank-outline'
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Your Tasks</Text>
      <ScrollView style={{height: '93%'}}>
      <View style={styles.taskContainer}>
        <Pressable style={styles.checkbox} onPress={() => setIsChecked(!isChecked)}>
            <MaterialCommunityIcons name={iconName} size={25} color="black" />
        </Pressable>
        <View style={{paddingLeft: 10}}>
            <Text style={styles.taskTitle}>MyTask</Text>
            <View style={styles.taskDetails}>
                <Text style={styles.date}>Mar 21</Text>
                <Text>Category</Text>
                <Text>Priority</Text>
            </View>
            
        </View>
        
        <View style={styles.viewTask}>
            <MaterialCommunityIcons name='clipboard-outline' size={30} color="black"/>
        </View>

        <View style={styles.deleteTask}>
            <MaterialCommunityIcons name="delete-outline" size={30} color="black"/>
        </View>
      </View>
      </ScrollView>
      <View style={styles.addTask}>
        <Pressable style={styles.addTaskButton} onPress={() => navigation.navigate('TaskView')}>
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
        paddingBottom: 10
    },
    taskContainer: {
        height: 90,
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
        width: 50,
        height: 50,
        marginTop: 30,
        marginBottom: 20,
        marginLeft: 20
    },
    deleteTask: {
        width: 50,
        height: 50,
        marginTop: 30,
        marginBottom: 20,
    },
    checkbox: {
        marginTop: 'auto',
        marginBottom: 'auto',
        paddingLeft: 12
    },
    addTask: {
        position: 'absolute',
        bottom: 20,
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