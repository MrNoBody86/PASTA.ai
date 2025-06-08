import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import {
  signInWithGoogle,
  signOutFromGoogle,
  getCurrentGoogleUser,
  fetchGoogleFitData,
  fetchGoogleCalendarEvents,
} from '@/src/services/GoogleApiService'; // Adjust path as needed

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


const GoogleSyncPage = () => {
  const [googleUser, setGoogleUser] = useState<any>(null); // Store userInfo from GoogleSignin
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fitData, setFitData] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoading(true);
      const currentUser = await getCurrentGoogleUser();
      if (currentUser) {
        setGoogleUser(currentUser.userInfo);
        setAccessToken(currentUser.accessToken);
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const { userInfo, accessToken: newAccessToken } = await signInWithGoogle();
      setGoogleUser(userInfo);
      setAccessToken(newAccessToken);
    } catch (error) {
      Alert.alert('Sign-In Error', 'Could not sign in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOutFromGoogle();
      setGoogleUser(null);
      setAccessToken(null);
      setFitData(null);
      setCalendarEvents([]);
    } catch (error) {
      Alert.alert('Sign-Out Error', 'Could not sign out from Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchFitData = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(0, 0, 0, 0); // Start of today
      const endTime = new Date(now);
      endTime.setHours(23, 59, 59, 999); // End of today

      const rawFitData = await fetchGoogleFitData(accessToken, startTime.getTime(), endTime.getTime());
      const parsedData = parseFitData(rawFitData);
      setFitData(parsedData);
      Alert.alert('Google Fit', `Fetched today's data:\nSteps: ${parsedData.steps}\nCalories: ${parsedData.calories}\nDistance: ${parsedData.distance} km`);
    } catch (error) {
      Alert.alert('Fit Data Error', 'Could not fetch Google Fit data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchCalendarEvents = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const events = await fetchGoogleCalendarEvents(accessToken, 'primary', today.toISOString(), nextWeek.toISOString());
      setCalendarEvents(events);
      Alert.alert('Google Calendar', `Fetched ${events.length} events for the next 7 days.`);
    } catch (error) {
      Alert.alert('Calendar Data Error', 'Could not fetch Google Calendar events.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !googleUser) { // Initial loading
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Google Services Sync</Text>
      {isLoading && <ActivityIndicator style={styles.loader} />}

      {!googleUser ? (
        <Button title="Connect with Google" onPress={handleSignIn} disabled={isLoading} />
      ) : (
        <View style={styles.signedInContainer}>
          <Text style={styles.emailText}>Connected as: {googleUser.user?.email}</Text>
          <View style={styles.buttonGroup}>
            <Button title="Fetch Today's Fit Data" onPress={handleFetchFitData} disabled={isLoading || !accessToken} />
            <Button title="Fetch Calendar (Next 7 Days)" onPress={handleFetchCalendarEvents} disabled={isLoading || !accessToken}/>
          </View>

          {fitData && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Today's Fitness Data:</Text>
              <Text>Steps: {fitData.steps}</Text>
              <Text>Calories Burned: {fitData.calories}</Text>
              <Text>Distance: {fitData.distance} km</Text>
            </View>
          )}

          {calendarEvents.length > 0 && (
            <View style={styles.dataSection}>
              <Text style={styles.sectionTitle}>Upcoming Calendar Events:</Text>
              {calendarEvents.slice(0, 5).map((event: any) => ( // Show first 5
                <View key={event.id} style={styles.eventItem}>
                    <Text style={styles.eventSummary}>{event.summary}</Text>
                    <Text>{new Date(event.start.dateTime || event.start.date).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={{marginTop: 30}}>
            <Button title="Disconnect Google Account" onPress={handleSignOut} color="red" disabled={isLoading}/>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  signedInContainer: {
    width: '100%',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  dataSection: {
    width: '100%',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  eventItem: {
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd'
  },
  eventSummary: {
    fontWeight: '600'
  }
});

export default GoogleSyncPage;