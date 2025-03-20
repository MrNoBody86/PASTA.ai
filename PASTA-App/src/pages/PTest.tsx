import React from 'react'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Pressable, ScrollView } from 'react-native';
import Option from '../../components/Option';
import { useEffect, useState } from 'react';
import { quizData } from '../../questions';
import Results from '@/src/pages/Results';
import { FIREBASE_AUTH, FIREBASE_DB } from '@/FirebaseConfig';
import { NavigationProp } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp, orderBy, query, getDocs } from 'firebase/firestore';

// Main component for the personality test
const PTest = () => {
  // State variables for questions and scores
  const [questions, setQuestions] = useState<any>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const noOfQuestions = 50;
  
  // Initial scores for each personality trait
  const [scoreEXT, setEXT] = useState(20);
  const [scoreAGG, setAGG] = useState(14);
  const [scoreCON, setCON] = useState(14);
  const [scoreNEU, setNEU] = useState(38);
  const [scoreOPE, setOPE] = useState(8);
  
  // Mapping options to scores
  const scoreOption = {"Disagree":1, "Slightly Disagree":2, "Neutral":3, "Slightly Agree":4, "Agree":5}
  
  // State to store various aspects of user progress
  const [questionScore, setQuestionScore] = useState([]);
  const [personalityScore, setpersonalityScore] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [questionsAnswered, setQuestionsAnswered] = useState<any>([]);
  
  // State for option selection and progress tracking
  const [checkIfSelected, setCheckIfSelected] = useState({
    option1: false,
    option2: false,
    option3: false,
    option4: false,
    option5: false,
  });
  const [percentageComplete, setPercentageComplete] = useState(0);
  
  // Variables to temporarily hold updated scores
  let newEXT = scoreEXT;
  let newAGG = scoreAGG;
  let newCON = scoreCON;
  let newNEU = scoreNEU;
  let newOPE = scoreOPE;

  // Load quiz data and previous scores on component mount
  useEffect(() => {
    setQuestions(quizData);
    getPersonalityQuestionScores(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid);
  }, []);
  
  let currentQuestion = questions[currentQuestionIndex];

  // Function to save individual question scores to Firebase
  async function addPersonalityQuestionScores(db, userId, question, score, trait){
    try {
      const messagesRef = collection(db, "users", userId, "personalityQuestionScores");
      const newMessage = {
        question: question,
        score: score,
        trait: trait,
        timestamp: serverTimestamp(),
      };
      const docRef = await addDoc(messagesRef, newMessage);
      // console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e; //rethrow the error to be handled by the caller
    }
  }

  // Function to save overall personality scores to Firebase
  async function addPersonalityScores(db, userId, scoreEXT, scoreAGG, scoreCON, scoreNEU, scoreOPE){
    try {
      const messagesRef = collection(db, "users", userId, "personalityScores");
      const newMessage = {
        scoreEXT: scoreEXT,
        scoreAGG: scoreAGG,
        scoreCON: scoreCON,
        scoreNEU: scoreNEU,
        scoreOPE: scoreOPE,
        timestamp: serverTimestamp(),
      };
      const docRef = await addDoc(messagesRef, newMessage);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
      throw e; //rethrow the error to be handled by the caller
    }
  }

  // Function to fetch individual question scores from Firebase
  async function getPersonalityQuestionScores(db, userId){
    const messagesRef = collection(db, "users", userId, "personalityQuestionScores");
      const q = query(
          messagesRef,
          orderBy("timestamp"), // order ascending, oldest first.
      );
    const querySnapshot = await getDocs(q);
    const questionScores = [];
    querySnapshot.forEach((doc) => {
        // console.log("Document  => ", doc.id);
        const messageData = {
        id: doc.id,
        question: doc.data().question,
        score: doc.data().score,
        trait: doc.data().trait
        // timestamp: doc.data().timestamp,
        }
        questionScores.push(messageData);
      });
    setQuestionScore(questionScores);
}

  // Function to fetch overall personality scores from Firebase
  async function getPersonalityScores(db, userId){
    const messagesRef = collection(db, "users", userId, "personalityScores");
    const querySnapshot = await getDocs(messagesRef);
    const personalityScores = [];
    querySnapshot.forEach((doc) => {
      // console.log("Document  => ", doc.data());
      const messageData = {
        id: doc.id,
        scoreEXT: doc.data().scoreEXT,
        scoreAGG: doc.data().scoreAGG,
        scoreCON: doc.data().scoreCON,
        scoreNEU: doc.data().scoreNEU,
        scoreOPE: doc.data().scoreOPE,
          // timestamp: doc.data().timestamp,
      }
      personalityScores.push(messageData);
    });
    setpersonalityScore(personalityScores);
    setEXT(personalityScore[0]["scoreEXT"]);
    setAGG(personalityScore[0]["scoreAGG"]);
    setCON(personalityScore[0]["scoreCON"]);
    setNEU(personalityScore[0]["scoreNEU"]);
    setOPE(personalityScore[0]["scoreOPE"]);
  }

  // Track percentage completion of the quiz
  useEffect(() => {
    let percentage = (currentQuestionIndex + 1) * 2;
    setPercentageComplete(percentage);
  }, [currentQuestionIndex]);

  // Handle answer selection and score calculation
  const handleNext = () => {

    const questionData = {
      question: currentQuestion?.question,
      score: scoreOption[selectedOption],
      trait: currentQuestion?.trait,
    }
    const updatedQuestions = [...questionsAnswered, questionData];
    setQuestionsAnswered(updatedQuestions);

    if (currentQuestion?.trait === "Extraversion"){
      newEXT = scoreEXT + (scoreOption[selectedOption]*currentQuestion?.value);
      setEXT(newEXT);
    } else if (currentQuestion?.trait === "Agreeableness"){
      newAGG = scoreAGG + (scoreOption[selectedOption]*currentQuestion?.value);
      setAGG(newAGG);
    } else if (currentQuestion?.trait === "Conscientiousness"){
      newCON = scoreCON + (scoreOption[selectedOption]*currentQuestion?.value);
      setCON(newCON);
    } else if (currentQuestion?.trait === "Neuroticism"){
      newNEU = scoreNEU + (scoreOption[selectedOption]*currentQuestion?.value);
      setNEU(newNEU);
    } else if (currentQuestion?.trait === "Openess"){
      newOPE = scoreOPE + (scoreOption[selectedOption]*currentQuestion?.value);
      setOPE(newOPE);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevQuestion) => prevQuestion + 1);
      setSelectedOption("");
    } else {
      const questionData = {
        question: currentQuestion?.question,
        score: scoreOption[selectedOption],
        trait: currentQuestion?.trait,
      }
      // console.log("Question Data", questionData);
      const updatedQuestions = [...questionsAnswered, questionData];
      setQuestionsAnswered(updatedQuestions);
      
      console.log("Questions Answered", updatedQuestions);
      for (let i = 0; i < updatedQuestions.length; i++){
        addPersonalityQuestionScores(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, updatedQuestions[i].question, updatedQuestions[i].score, updatedQuestions[i].trait);
      }
      // console.log("Scores:", newEXT, newAGG, newCON, newNEU, newOPE);
      addPersonalityScores(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid, newEXT, newAGG, newCON, newNEU, newOPE);
      
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
    setEXT(20);
    setAGG(14);
    setCON(14);
    setNEU(38);
    setOPE(8);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setSelectedOption("");
    setQuestionsAnswered([]);
  }

  // Display results if quiz is completed
  if (showResult || questionScore.length != 0){
    getPersonalityScores(FIREBASE_DB, FIREBASE_AUTH.currentUser?.uid);
    return  <Results restart={restart} scoreEXT={scoreEXT} scoreAGG={scoreAGG} scoreCON={scoreCON} scoreNEU={scoreNEU} scoreOPE={scoreOPE} />
  }

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

// Styles for the component
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