import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CircularProgress from 'react-native-circular-progress-indicator'

// The Results component displays the quiz results for each personality trait.
// It accepts scores for Extraversion, Agreeableness, Conscientiousness, Neuroticism, and Openness,
// as well as a restart function as props.
const Results = ({
  scoreEXT,
  scoreAGG,
  scoreCON,
  scoreNEU,
  scoreOPE,
  restart,
}: {
  scoreEXT: number;
  scoreAGG: number;
  scoreCON: number;
  scoreNEU: number;
  scoreOPE: number;
  restart: () => void;
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        {/* Displays a message indicating the quiz is complete */}
        <Text style={{ fontWeight: "600", fontSize: 20, color: "#004643", paddingBottom: 20 }}>
          Personality Test Complete
        </Text>


        {/* Displays scores for each personality trait */}
        {/* <Text style={{fontWeight: "700", fontSize: 16, color: "#004643"}} >{score}/10</Text> */}
        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 20 }}>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <CircularProgress
                    value={scoreEXT} 
                    radius={60}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={40}
                    activeStrokeColor='#ff8c00'
            />
            <Text style={{fontSize: 18, marginTop: 5}}>Extraversion</Text>
          </View>
          <View>
            <CircularProgress
                    value={scoreAGG} 
                    radius={60}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={40}
                    activeStrokeColor='#3cb371'
            />
            <Text style={{fontSize: 18, marginTop: 5}}>Agreeableness</Text>
          </View>
          
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%", marginBottom: 20 }}>
          <View style={{ flexDirection: "column", alignItems: "center" }}>
            <CircularProgress
                    value={scoreCON} 
                    radius={60}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={40}
                    activeStrokeColor='#007acc'
            />
            <Text style={{fontSize: 18, marginTop: 5}}>CON</Text>
          </View>
          <View>
            <CircularProgress
                    value={scoreNEU} 
                    radius={60}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={40}
                    activeStrokeColor='#dc143c'
            />
            <Text style={{fontSize: 18, marginTop: 5}}>Neuroticism</Text>
          </View>
        </View>
        
        <CircularProgress
                    value={scoreOPE} 
                    radius={60}
                    duration={2000}
                    progressValueColor='black'
                    maxValue={40}
                    activeStrokeColor='rgba(138, 43, 226, 1)'
          />
        <Text style={{fontSize: 18, marginTop: 5}}>Openness</Text>

        {/* Button for restarting the quiz (currently commented out) */}
        <TouchableOpacity onPress={restart} activeOpacity={.8} style={styles.btn} >
            <Text>Retake</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Results;

// Styles for the Results component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e4e4e4",
    padding: 20,
  },
  wrapper: {
    width: "100%",
    maxHeight: 700,
    backgroundColor: "#fff",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  btn: {
    width: 100,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ABD1C6",
    marginTop: 20,
  },
});
