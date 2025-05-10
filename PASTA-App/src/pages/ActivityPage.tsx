import { View, Text, StyleSheet, Pressable } from 'react-native'
import { useState } from 'react'
import { TextInput } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker'
import { NavigationProp } from '@react-navigation/native'

interface RouterProps {
    navigation: NavigationProp<any, any>;
}

const ActivityPage = ({ route, navigation }) => {
    var { INActivityId, INActivityTitle, INActivityType, INStartDate, INStartTime, INDuration, INDistance, INCalories, INSteps, INActivityDescription } = route.params;
    const [activityId, setActivityId] = useState(INActivityId);
    const [activityTitle, setActivityTitle] = useState(INActivityTitle);
    const [activityType, setActivityType] = useState(INActivityType);
    const [activityDistance, setActivityDistance] = useState(INDistance?.toString() || '');
    const [activityCalories, setActivityCalories] = useState(INCalories?.toString() || '');
    const [activitySteps, setActivitySteps] = useState(INSteps?.toString() || '');
    const [activityDescription, setActivityDescription] = useState(INActivityDescription);
    const [date, setDate] = useState(INStartDate);
    const [time, setTime] = useState(INStartTime);
    const [duration, setDuration] = useState(INDuration);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [showDuration, setShowDuration] = useState(false);

    const onChangeDate = (e, selectedDate) => {
        setDate(selectedDate);
        setShowDate(false);
    }
    const onChangeTime = (e, selectedDate) => {
        setTime(selectedDate);
        setShowTime(false);
    }
    const onChangeDuration = (e, selectedDate) => {
        setDuration(selectedDate);
        setShowDuration(false);
    }

    const showDatePicker = () => {
        setShowDate(true);
        setShowTime(false);
        setShowDuration(false);
    }

    const showTimePicker = () => {
        setShowTime(true);
        setShowDate(false);
        setShowDuration(false);
    }

    const showDurationPicker = () => {
        setShowDuration(true);
        setShowDate(false);
        setShowTime(false);
    }

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 30, fontWeight: 'bold'}}>Add Activity</Text>
      <Text style={styles.inputText}>Title</Text>
      <TextInput style={styles.inputBox} placeholder='Add Title' value={activityTitle} onChangeText={setActivityTitle}></TextInput>
      <Text style={styles.inputText}>Activity</Text>
      <TextInput style={styles.inputBox} placeholder='Add Activity' value={activityType} onChangeText={setActivityType}></TextInput>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.inputText}>Start</Text>
        <View style={styles.datetime}>
            <Pressable style={styles.dateButton} onPress={() => showDatePicker()}>
                <Text style={{fontSize: 16}}>{date.toLocaleDateString()}</Text>
            </Pressable>

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
      </View>
      <View style={styles.durationTime}>
        <Text style={styles.inputText}>Duration</Text>
        <Pressable style={{height: 35, backgroundColor: 'white', padding: 5, marginTop: 15, borderRadius: 10}} onPress={() => showDurationPicker()}>
            <Text style={{fontSize: 16}}>{`${duration.getHours().toString()}h ${duration.getMinutes().toString().padStart(2, '0')}m`}</Text>
            {
                showDuration && (
                <DateTimePicker
                    value={duration}
                    mode={'time'}
                    display='clock'
                    is24Hour={true}
                    onChange={onChangeDuration}
            />)}
        </Pressable>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.inputText}>Distance</Text>
        <TextInput style={{height: 40, marginTop: 18}} placeholder='Add Kms' value={activityDistance} onChangeText={setActivityDistance}></TextInput>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.inputText}>Energy Expended</Text>
        <TextInput style={{height: 40, marginTop: 18}} placeholder='Add Calories' value={activityCalories} onChangeText={setActivityCalories}></TextInput>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.inputText}>Steps</Text>
        <TextInput style={{height: 40, marginTop: 18}} placeholder='Add Steps' value={activitySteps} onChangeText={setActivitySteps}></TextInput>
      </View>
      <TextInput style={{marginTop: 10, backgroundColor: 'white', borderRadius: 15}} placeholder='Add Notes' value={activityDescription} onChangeText={setActivityDescription}></TextInput>
      
      <Pressable style={{backgroundColor: 'black', padding: 10, borderRadius: 20, marginTop: 50}} onPress={() => {console.log(activitySteps)}}>
        <Text style={{color: 'white', fontSize: 20, textAlign: 'center', fontWeight:'bold'}}>Save</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    inputText: {
        fontSize: 20,
        paddingTop: 20,
        paddingBottom: 8,
    },
    inputBox: {
        backgroundColor: 'white',
        borderRadius: 10,
    },
    datetime: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginTop: 15,
    },
    durationTime: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dateButton: {
        backgroundColor: 'white',
        padding: 5,
        borderRadius: 10,
    }
})

export default ActivityPage