import React from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Pressable, ScrollView } from 'react-native';
import Option from '../components/Option';
import { useEffect, useState } from 'react';
import { quizData } from '../questions';
import Results from '../components/Results';
import { FIREBASE_AUTH } from '@/FirebaseConfig';
import { NavigationProp } from '@react-navigation/native';
import Chat from '../components/Chat';


const PTest = () => {
  const [questions, setQuestions] = useState<any>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scoreEXT, setEXT] = useState(20);
  const [scoreAGG, setAGG] = useState(14);
  const [scoreCON, setCON] = useState(14);
  const [scoreNEU, setNEU] = useState(38);
  const [scoreOPE, setOPE] = useState(8);
  const scoreOption = {"Disagree":1, "Slightly Disagree":2, "Neutral":3, "Slightly Agree":4, "Agree":5}
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [checkIfSelected, setCheckIfSelected] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  })
  const [percentageComplete, setPercentageComplete] = useState(0);

  useEffect(() => {
    setQuestions(quizData)
  }, [])
  
  let currentQuestion = questions[currentQuestionIndex];


  useEffect(() => {
    // let percentage = (((currentQuestionIndex + 1) / questions?.length) * 100);
    let percentage = (currentQuestionIndex + 1) * 2;

    setPercentageComplete(percentage);
  }, [currentQuestionIndex]);


  const handleNext = () => {
    let correctAnswer = questions[currentQuestionIndex]?.answer;
    let trait = questions[currentQuestionIndex]?.trait;

    if (currentQuestion?.trait === "Extraversion"){
      setEXT((prevScore) => prevScore + (scoreOption[selectedOption]*currentQuestion?.value));
    } else if (currentQuestion?.trait === "Agreeableness"){
      setAGG((prevScore) => prevScore + (scoreOption[selectedOption]*currentQuestion?.value));
    } else if (currentQuestion?.trait === "Conscientiousness"){
      setCON((prevScore) => prevScore + (scoreOption[selectedOption]*currentQuestion?.value));
    } else if (currentQuestion?.trait === "Neuroticism"){
      setNEU((prevScore) => prevScore + (scoreOption[selectedOption]*currentQuestion?.value));
    } else if (currentQuestion?.trait === "Openess"){
      setOPE((prevScore) => prevScore + (scoreOption[selectedOption]*currentQuestion?.value));
    }


    if (selectedOption === correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }

    if (currentQuestionIndex < questions?.length - 1) {
      setCurrentQuestionIndex((prevQuestion) => prevQuestion + 1);
      setSelectedOption("");
    } else {
      setShowResult(true);
    }

    setCheckIfSelected({
      option1: false,
      option2: false,
      option3: false,
      option4: false,
      option5: false,
    })
  }

  const checkOptionOne = () => {
    setCheckIfSelected({
      option1: true,
      option2: false,
      option3: false,
      option4: false,
      option5: false,
    });
  };

  const checkOptionTwo = () => {
    setCheckIfSelected({
      option1: false,
      option2: true,
      option3: false,
      option4: false,
      option5: false,
    });
  };

  const checkOptionThree = () => {
    setCheckIfSelected({
      option1: false,
      option2: false,
      option3: true,
      option4: false,
      option5: false,
    });
  };

  const checkOptionFour = () => {
    setCheckIfSelected({
      option1: false,
      option2: false,
      option3: false,
      option4: true,
      option5: false,
    });
  };

  const checkOptionFive = () => {
    setCheckIfSelected({
      option1: false,
      option2: false,
      option3: false,
      option4: false,
      option5: true,
    });
  };

  const restart = () => {
    setScore(0);
    setAGG(20);
    setCON(14);
    setEXT(14);
    setNEU(38);
    setOPE(8);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setSelectedOption("");
  }

  if (showResult) return  <Results restart={restart} score={score} scoreEXT={scoreEXT} scoreAGG={scoreAGG} scoreCON={scoreCON} scoreNEU={scoreNEU} scoreOPE={scoreOPE} />

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <SafeAreaView>
        <ScrollView>
        <View style={styles.countwrapper} >
          <Text style={{fontWeight: "600"}} >{currentQuestionIndex + 1}/{questions?.length}</Text>
        </View>

        <View style={styles.questionwrapper} >

          <View style={styles.progresswrapper} >
            <View style={[styles.progressBar, {width: `${percentageComplete}%`}]} ></View>
            <View style={styles.progresscount} >
                <Text style={styles.percentage}>{percentageComplete}</Text>
            </View>
          </View>

         <Text style={{ fontWeight: "500", textAlign: "center" }}>
            {currentQuestion?.question}
         </Text>
        </View>

        <View style={styles.optionswrapper} >
          <Option setSelectedOption={setSelectedOption} checkIfSelected={checkOptionOne} isSelected={checkIfSelected.option1} option={currentQuestion?.options[0]} />
          <Option setSelectedOption={setSelectedOption} checkIfSelected={checkOptionTwo} isSelected={checkIfSelected.option2} option={currentQuestion?.options[1]} />
          <Option setSelectedOption={setSelectedOption} checkIfSelected={checkOptionThree} isSelected={checkIfSelected.option3} option={currentQuestion?.options[2]} />
          <Option setSelectedOption={setSelectedOption} checkIfSelected={checkOptionFour} isSelected={checkIfSelected.option4} option={currentQuestion?.options[3]} />
          <Option setSelectedOption={setSelectedOption} checkIfSelected={checkOptionFive} isSelected={checkIfSelected.option5} option={currentQuestion?.options[4]} />
        </View>

        <TouchableOpacity onPress={handleNext} activeOpacity={.8} style={[styles.btn, {backgroundColor: selectedOption ? "#004643" : "#A9A9A9"}]} disabled={!selectedOption}>
          <Text style={{color:"white", fontWeight: "600"}} >Next</Text>
        </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

export default PTest

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e4e4',
    padding: 20,
  },
  countwrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10
  },
  questionwrapper: {
    marginTop: 60,
    width: "100%",
    height: 180,
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    alignItems: "center",
  },
  progresswrapper: {
    width: 70,
    height: 70,
    backgroundColor: "#ABD1C6",
    borderRadius: 50,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    marginBottom: 30,
    marginTop: -50,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#004643",
    alignSelf: "flex-end",
  },
  progresscount: {
    height: 58,
    width: 58,
    borderRadius: 50,
    backgroundColor: "#fff",
    zIndex: 10,
    position: "absolute",
    top: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  percentage: {
    fontWeight: "600",
    fontSize: 18,
    color: "#004643",
  },
  optionswrapper: {
    marginTop: 40,
    width: "100%",
  },
  btn: {
    width: "100%",
    height: 50,
    borderRadius: 16,
    backgroundColor: "#004643",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  button: {
    backgroundColor: '#004643',
    padding: 10,
    justifyContent: 'center',
    flexDirection: 'row',
    margin: 'auto',
    borderRadius: 5,
    fontFamily: 'sans-serif',
    maxWidth: 100,
    alignItems: 'center',
    alignContent: 'center',
    position: 'relative'
  },
  buttonText: {
    color: 'white'
  }
});