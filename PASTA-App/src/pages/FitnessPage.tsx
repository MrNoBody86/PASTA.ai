import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import CircularProgress from 'react-native-circular-progress-indicator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationProp } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'


interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const FitnessPage = ({ navigation, route } : RouterProps) => {

    const ActivityDetails = [{
        'ActivityId': '001',
        'ActivityTitle': 'My Daily Walk',
        'ActivityType': 'Walking',
        'StartDate': new Date(),
        'StartTime': new Date(),
        'Duration': new Date(),
        'Distance': 2,
        'Calories': 100,
        'Steps': 1000,
        'ActivityDescription': 'Usual walk',
      }, {
        'ActivityId': '002',
        'ActivityTitle': 'Treadmill',
        'ActivityType': 'Walking',
        'StartDate': new Date(),
        'StartTime': new Date(),
        'Duration': new Date(),
        'Distance': 3,
        'Calories': 130,
        'Steps': 1200,
        'ActivityDescription': 'I walked on treadmill for 30 minutes',
      }, {
        'ActivityId': '003',
        'ActivityTitle': 'Jogging at Morning and Evening and some running',
        'ActivityType': 'Jogging',
        'StartDate': new Date(),
        'StartTime': new Date(),
        'Duration': new Date(),
        'Distance': 3,
        'Calories': 200,
        'Steps': 3000,
        'ActivityDescription': 'I went jogging at 6 AM',
      },]

  return (
    <View style={styles.container}>
        
        <View style={styles.statsContainer}>
            <CircularProgress
                value={100} 
                radius={70}
                duration={2000}
                progressValueColor='black'
                maxValue={5000}
                activeStrokeColor='black'
                title='Steps' />
            <View style={styles.calAndKmsContainer}>
                <CircularProgress
                    value={100} 
                    radius={45}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={1000}
                    activeStrokeColor='black'
                    title='Cal' />
                <CircularProgress
                    value={2} 
                    radius={45}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={50}
                    activeStrokeColor='black'
                    title='Kms' />
            </View>
        </View>
        <View style={styles.activityContainer}>
            <Text style={styles.text}>Your Activities</Text>
            <View style={styles.insideContainer}>
                <ScrollView style={styles.activityRows}>
                    {ActivityDetails.map((activity, index) => (
                        <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', padding: 10}}>
                            <Text style={{fontSize: 20}}>{activity.ActivityTitle}</Text>
                            <MaterialCommunityIcons name='chevron-right' size={30} color="black"/>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
        <View style={styles.chatBotContainer}>
            <Text style={styles.text}>Go to Fitness Chat Bot -&gt;</Text>
        </View>
        <View style={{position: 'absolute', bottom: 20, left: 20}}>
            <Pressable style={styles.addActivity} onPress={() => {navigation.navigate('ActivityPage')}}>
                <MaterialCommunityIcons name='plus' size={30} color="black"/>
            </Pressable>
        </View>
        
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    statsContainer: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calAndKmsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 80,
    },
    chatBotContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    activityContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    insideContainer: {
        height: 150,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 10,
    },
    addActivity: {
        position: 'absolute',
        top: 65,
        left: 310,
        backgroundColor: 'white',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    }
})

export default FitnessPage