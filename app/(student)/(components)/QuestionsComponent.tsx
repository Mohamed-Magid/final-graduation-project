import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  BackHandler,
  Alert,
} from 'react-native';
import { RadioButton, Checkbox } from 'react-native-paper';
import { QuestionTyped } from './type';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { router } from 'expo-router';

interface Props {
  sampleQuestions: QuestionTyped[];
  timeLeft: number;
  setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

const QuestionsComponent = ({
  sampleQuestions = [],
  timeLeft,
  setTimeLeft,
  submitted,
  setSubmitted,
}: Props) => {
  const [selectedOptionIndices, setSelectedOptionIndices] = useState<
    (string | string[] | null)[]
  >(new Array(sampleQuestions.length).fill(null));
  const [timeEnroll] = useState<string>(moment().format('hh:mm:ss')); // Initialize with current time
  const [timeSubmit, setTimeSubmit] = useState<string | null>(null); // Initialize as null
  const [timeTaken, setTimeTaken] = useState<number | null>(null); // Initialize as null
  const [score, setScore] = useState<number>(0);


  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === 0) {
          clearInterval(interval);
          handleSubmit();
          return prevTime;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle back press to confirm exit if exam is not submitted yet and prevent going back if exam is submitted or time is up already
  useEffect(() => {
    const backAction = () => {
      if (!submitted) {
        Alert.alert(
          'Alert',
          'You have not submitted the exam. Are you sure you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            { text: 'Exit', onPress: () => { setSubmitted(true); router.replace('/(student)/(tabs)/Home'); } },
          ],
          { cancelable: false }
        );
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [submitted]);

  // Calculate the score when the exam is submitted
  useEffect(() => {
    if (submitted) {
      const FinalGrade = calculateScore();
      // setScore(calculatedScore);
      console.log('Score ==>> ', FinalGrade);
    }
  }, [submitted]);

  // Handle auto-submit when time is up
  // useEffect(() => {
  //   if (timeLeft === 0 || submitted) {
  //     handleSubmit();
  //   }
  // }, []);

  // Calculate the time taken when timeSubmit is set
  useEffect(() => {
    if (timeSubmit && timeEnroll) {
      const timeTaken = moment
        .duration(
          moment(timeSubmit, 'hh:mm:ss').diff(moment(timeEnroll, 'hh:mm:ss'))
        )
        .asMinutes();
      setTimeTaken(timeTaken);
      console.log('Time taken:', timeTaken);
    }
  }, [timeSubmit, timeEnroll ]);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeSubmit(moment().format('hh:mm:ss'));
  };

  useEffect(() => {
    if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  // Handle back press to confirm exit if exam is not submitted yet and prevent going back if exam is submitted or time is up already
  // const handleSubmit = () => {
  //   setSubmitted(true);
  //   setTimeLeft(0);
  //   if (submitted) {
  //     setTimeSubmit(moment().format('hh:mm:ss'));
  //     router.replace('/(student)/(tabs)/Home/')
  //   }
  // };

  const handleOptionPress = (questionIndex: number, optionId: string) => {
    if (submitted || timeLeft === 0) return;
    setSelectedOptionIndices((prevState) => {
      const newState = [...prevState];
      newState[questionIndex] = optionId;
      return newState;
    });
  };

  const handleCheckboxPress = (questionIndex: number, optionId: string) => {
    if (submitted || timeLeft === 0) return;
    setSelectedOptionIndices((prevState) => {
      const newState = [...prevState];
      if (!Array.isArray(newState[questionIndex])) {
        newState[questionIndex] = [];
      }
      const optionIndex = (newState[questionIndex] as string[]).indexOf(
        optionId
      );
      if (optionIndex !== -1) {
        (newState[questionIndex] as string[]).splice(optionIndex, 1);
      } else {
        (newState[questionIndex] as string[]).push(optionId);
      }
      return newState;
    });
  };

  const calculateScore = () => {
    return sampleQuestions.reduce((correctAnswersCount, question, index) => {
      const userChoiceIds = selectedOptionIndices[index];
      if (userChoiceIds !== null) {
        if (Array.isArray(userChoiceIds)) {
          // For optional-choice questions
          const correctOptionIds = question.options.values
            .filter((option) => option.isCorrect)
            .map((option) => option.id);
          const isAllCorrectlySelected = correctOptionIds.every((optionId) =>
            userChoiceIds.includes(optionId)
          );
          const isAllIncorrectlySelected = userChoiceIds.every(
            (optionId) => !correctOptionIds.includes(optionId)
          );
          if (
            isAllCorrectlySelected &&
            userChoiceIds.length === correctOptionIds.length
          ) {
            correctAnswersCount++;
          }
        } else {
          // For multiple-choice questions
          if (
            question.options.values.find(
              (option) => option.id === userChoiceIds
            )?.isCorrect
          ) {
            correctAnswersCount++;
          }
        }
      }
      return correctAnswersCount;
    }, 0);
  };

  const renderQuestions = () => {
    return sampleQuestions.map((question, index) => (
      <View key={question.id} style={styles.questionContainer}>
        <Text style={styles.question}>{`Q${index + 1}: ${
          question.question
        }`}</Text>
        {question.imageLink && (
          <Image source={{ uri: question.imageLink }} style={styles.image} />
        )}
        {question.options.values.map((option) => (
          <View key={option.id} style={styles.option}>
            {question.type === 'multiple-choice' ? (
              <RadioButton
                value={option.id}
                status={
                  selectedOptionIndices[index] === option.id
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => handleOptionPress(index, option.id)}
                disabled={submitted || timeLeft === 0}
              />
            ) : question.type === 'optional-choice' ? (
              <Checkbox
                status={
                  (selectedOptionIndices[index] as string[])?.includes(
                    option.id
                  )
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => handleCheckboxPress(index, option.id)}
                disabled={submitted || timeLeft === 0}
              />
            ) : (
              <RadioButton
                value={option.id}
                status={
                  selectedOptionIndices[index] === option.id
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => handleOptionPress(index, option.id)}
                disabled={submitted || timeLeft === 0}
              />
            )}
            <Text style={styles.optionText}>{option.text}</Text>
          </View>
        ))}
      </View>
    ));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderQuestions()}
      {!submitted && (
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      )
    }
    </ScrollView>
  );
};
export default QuestionsComponent;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: 'lightgray',
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'lightgray',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 15,
  },
  optionText: {
    width: '100%',
    fontSize: 16,
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#F19A1A',
    width: '65%',
    alignSelf: 'center',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    margin: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 10,
  },
});
