import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useEffect, useState } from 'react'
import CircularProgress from 'react-native-circular-progress-indicator'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { NavigationProp } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'
import { collection, query, orderBy, getDocs, limit, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from '@/FirebaseConfig'
import GoogleFit, { Scopes } from 'react-native-google-fit';

interface RouterProps {
  navigation: NavigationProp<any, any>;
}

const FitnessPage = ({ navigation, route } : RouterProps) => {

    const [allActivities, setAllActivities] = useState([]);
    const [stepCount, setStepCount] = useState(0);
    const [calories, setCalories] = useState(0);
    const [distance, setDistance] = useState(0);
    const [screenLoading, setScreenLoading] = useState(true);

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
    }

    async function deleteActivityFromFirebase(activityId, activityIndex) {
        try {
            const userUid = FIREBASE_AUTH.currentUser?.uid;
            const activityRef = doc(FIREBASE_DB, "users", userUid, "activities", activityId);
            await deleteDoc(activityRef);
            console.log("Activity deleted successfully");
            setAllActivities(prevActivities => {
                const updatedActivities = [...prevActivities];
                updatedActivities.splice(activityIndex, 1);
                return updatedActivities;
            });
        } catch (error) {
            console.error("Error deleting activity:", error);
        }
    }

    const fetchGoogleFitData = async () => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 1); // fetch from yesterday

        const opt = {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            bucketUnit: 'DAY',
            bucketInterval: 1,
        };

        GoogleFit.getDailyStepCountSamples(opt).then(res => {
            const stepsData = res.find(item => item.source === 'com.google.android.gms:estimated_steps');
            if (stepsData && stepsData.steps.length > 0) {
            const stepCount = stepsData.steps[0].value;
            setStepCount(stepCount); // define this in your useState
            }
        });

        GoogleFit.getDailyCalorieSamples(opt).then(res => {
            if (res.length > 0) {
            const cal = res[0].calorie;
            setCalories(cal); // useState
            }
        });

        GoogleFit.getDailyDistanceSamples(opt).then(res => {
            if (res.length > 0) {
            const dist = res[0].distance;
            setDistance(dist / 1000); // convert meters to kms
            }
        });
        };
    
    useEffect(() => {
        if (FIREBASE_AUTH.currentUser?.uid) {
            getActivitiesFromFireBase(FIREBASE_DB, FIREBASE_AUTH.currentUser.uid, 10);
        }
        const options = {
            scopes: [
            Scopes.FITNESS_ACTIVITY_READ,
            Scopes.FITNESS_ACTIVITY_WRITE,
            Scopes.FITNESS_BODY_READ,
            Scopes.FITNESS_BODY_WRITE,
            ],
        };
        console.log('Google Fit authorization check');
        GoogleFit.checkIsAuthorized().then(() => {
            if (!GoogleFit.isAuthorized) {
            GoogleFit.authorize(options)
                .then(authResult => {
                if (authResult.success) {
                    console.log('Google Fit authorized');
                    fetchGoogleFitData();
                } else {
                    console.log('Google Fit auth failed', authResult.message);
                }
                })
                .catch(() => {
                console.log('Google Fit authorization error');
                });
            } else {
            console.log('Google Fit already authorized');
            fetchGoogleFitData();
            }
        });
        }, []);


    

  return (
    <View style={{flex: 1}}>
        <View style={styles.container}>
            <View style={styles.statsContainer}>
                <CircularProgress
                    value={2314} 
                    radius={70}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={5000}
                    activeStrokeColor='black'
                    title='Steps' />
                <View style={styles.calAndKmsContainer}>
                    <CircularProgress
                        value={134} 
                        radius={45}
                        duration={2000}
                        progressValueColor='black'
                        maxValue={1000}
                        activeStrokeColor='black'
                        title='Cal' />
                    <CircularProgress
                        value={2.4} 
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
                        {allActivities.length === 0 ? (
                            <Text style={{ fontSize: 16, textAlign: 'center', paddingVertical: 20, color: 'gray' }}>
                                No activities yet
                            </Text>
                        ) : (
                        allActivities.map((activity, index) => (
                            <View key={index} style={styles.activityRow}>
                                
                                <View style={styles.iconContainer}>
                                    <Pressable onPress={() => navigation.navigate('ActivityPage', {
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
                                    INTimestamp: activity.timestamp,
                                    })} style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                                        <Text style={styles.activityText}>{index + 1}. {activity.ActivityTitle}</Text>
                                    <MaterialCommunityIcons name="chevron-right" size={26} color={COLORS.icon} />
                                    </Pressable>
                                    <Pressable onPress={() => deleteActivityFromFirebase(activity.ActivityId, index)}>
                                    <MaterialCommunityIcons name="delete" size={22} color='black' />
                                    </Pressable>
                                </View>
                            </View>

                        ))
                        )}
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
                INDuration: new Date(new Date().setHours(0,0,0,0)),
                INDistance: null,
                INCalories: null,
                INSteps: null,
                INActivityDescription: '',
                INTimestamp: serverTimestamp(),
            })}}>
                <MaterialCommunityIcons name='plus' size={30} color="black"/>
        </Pressable>
    </View>
    
  )
}
const COLORS = {
  primary: '#3A86FF',
  secondary: '#FFBE0B',
  background: '#F1F3F6',
  card: '#FFFFFF',
  text: '#1D3557',
  icon: '#1D3557',
  shadow: '#000000',
  danger: '#E63946',
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: 'black',
    marginBottom: 8,
  },
  statsContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  calAndKmsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 20,
    width: '100%',
  },
  chatBotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insideContainer: {
    maxHeight: 160,
  },
  activityRows: {
    paddingVertical: 5,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  activityText: {
    fontSize: 16,
    color: 'black',
    flexShrink: 1,
    width: '80%',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
    width: '97%',
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
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default FitnessPage