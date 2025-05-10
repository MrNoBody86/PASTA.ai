import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useEffect, useState } from 'react'
import CircularProgress from 'react-native-circular-progress-indicator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationProp } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'
import { collection, query, orderBy, getDocs, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from '@/FirebaseConfig'

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const FitnessPage = ({ navigation, route } : RouterProps) => {

    const [allActivities, setAllActivities] = useState([]);

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
                ActivityTitle: doc.data().ActivityTitle,
                ActivityType: doc.data().ActivityType,
                StartDate: doc.data().StartDate.toDate(),
                StartTime: doc.data().StartTime.toDate(),
                Duration: doc.data().Duration.toDate(),
                Distance: doc.data().Distance,
                Calories: doc.data().Calories,
                Steps: doc.data().Steps,
            };
            fetchedActivities.push(ActivityData);
        });
        setAllActivities(fetchedActivities);
    }
    
    useEffect(() => {
        if (FIREBASE_AUTH.currentUser?.uid) {
            getActivitiesFromFireBase(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
        }
    })

    

  return (
    <View style={{flex: 1}}>
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
                        {allActivities.map((activity, index) => (
                            <View key={index} style={{flexDirection: 'row', justifyContent: 'space-between', padding: 5}}>
                                <Text style={{fontSize: 20, width: 250}}>{index+1}. {activity.ActivityTitle}</Text>
                                <View style={{flexDirection:'row', gap: 10, alignItems: 'center'}}>
                                    <Pressable onPress={() => {navigation.navigate('ActivityPage', {
                                        INActivityId: activity.ActivityId,
                                        INActivityTitle: activity.ActivityTitle,
                                        INActivityType: activity.ActivityType,
                                        INStartDate: activity.StartDate,
                                        INStartTime: activity.StartTime,
                                        INDuration: activity.Duration,
                                        INDistance: activity.Distance,
                                        INCalories: activity.Calories,
                                        INSteps: activity.Steps,
                                        INActivityDescription: activity.ActivityDescription,
                                    })}}>
                                        <MaterialCommunityIcons name='chevron-right' size={30} color="black"/>
                                    </Pressable>
                                    <Pressable onPress={() => {console.log("Delete activity")}}>
                                        <MaterialCommunityIcons name='delete' size={20} color='black' />
                                    </Pressable>
                                </View>
                                
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
            <View style={styles.chatBotContainer}>
                <Text style={styles.text}>Go to Fitness Chat Bot</Text>
                <Pressable onPress={() => {navigation.navigate('FitnessChatbot')}}>
                    <MaterialCommunityIcons name='chevron-right' size={30} color="black"/>
                </Pressable>
            </View>
        </View>
        <Pressable style={styles.addActivity} onPress={() => {navigation.navigate('ActivityPage', {
                INActivityId: '',
                INActivityTitle: '',
                INActivityType: '',
                INStartDate: new Date(),
                INStartTime: new Date(),
                INDuration: new Date(),
                INDistance: 0,
                INCalories: 0,
                INSteps: 0,
                INActivityDescription: '',
            })}}>
                <MaterialCommunityIcons name='plus' size={30} color="black"/>
        </Pressable>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    activityContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: 'white',
        borderRadius: 20,
    },
    insideContainer: {
        maxHeight: 150,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 5,
    },
    addActivity: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: 'white',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
})

export default FitnessPage