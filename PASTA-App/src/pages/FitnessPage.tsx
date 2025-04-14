import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import CircularProgress from 'react-native-circular-progress-indicator'

const FitnessPage = () => {
  return (
    <View style={styles.container}>
        <View style={styles.statsContainer}>
            <CircularProgress
                value={100} 
                radius={80}
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
        </View>
        <View style={styles.chatBotContainer}>
            <Text style={styles.text}>Go to Fitness Chat Bot -&gt;</Text>
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
})

export default FitnessPage