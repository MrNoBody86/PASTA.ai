import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
        <Text style={{ fontWeight: "600", fontSize: 16, color: "#004643" }}>
          Personality Test Complete
        </Text>

        {/* Displays a label for the score section */}
        <Text style={{ marginVertical: 20, fontWeight: "500" }}>
          Your Results:
        </Text>

        {/* Displays scores for each personality trait */}
        {/* <Text style={{fontWeight: "700", fontSize: 16, color: "#004643"}} >{score}/10</Text> */}
        <Text style={{fontWeight: "700", fontSize: 16, color: "#004643"}} >Extraversion: {scoreEXT}/40</Text>
        <Text style={{fontWeight: "700", fontSize: 16, color: "#004643"}} >Agreeableness: {scoreAGG}/40</Text>
        <Text style={{fontWeight: "700", fontSize: 16, color: "#004643"}} >Conscientiousness: {scoreCON}/40</Text>
        <Text style={{fontWeight: "700", fontSize: 16, color: "#004643"}} >Neuroticism: {scoreNEU}/40</Text>
        <Text style={{fontWeight: "700", fontSize: 16, color: "#004643"}} >Openness to Experience:{scoreOPE}/40</Text>

        {/* Button for restarting the quiz (currently commented out) */}
        {/* <TouchableOpacity onPress={restart} activeOpacity={.8} style={styles.btn} >
            <Text>Restart</Text>
        </TouchableOpacity> */}
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
    height: 250,
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
