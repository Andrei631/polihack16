import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Question from './Question';
import ProgressBar from './PorgressBar';
import { normalizeHeight, normalizeWidth } from './utils';
import Background from './Background';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
export default function App3({route}) {
  const [selectedCircle1, setSelectedCircle1] = useState(null);
  const [selectedCircle2, setSelectedCircle2] = useState(null);
  const [selectedCircle3, setSelectedCircle3] = useState(null);
  const navigation = useNavigation();
  params = route.params;
  const handleSubmit = () => {
    if (selectedCircle1 === null || selectedCircle2 === null || selectedCircle3 == null) {
      Toast.show({
        type: 'error',
        text1: 'You must complete all fields',
      });
    }else{
      navigation.navigate("App4", {...params, selectedCircle1: selectedCircle1, selectedCircle2: selectedCircle2, selectedCircle3: selectedCircle3});
    }
  };

  return (
    <View style={styles.fundal}>
      <Background />


      <View style={styles.form}>
        <View style={styles.text_box}>
            <Text style={styles.title}>Let's you started started</Text>
            <Text style={styles.enter}>But firstly, we have to gather some data about you</Text>
            
           <View style={styles.questions}>

            <Question
              text="Do you typically struggle with maintaining energy after lunch?"
              selectedCircle={selectedCircle1}
              setSelectedCircle={setSelectedCircle1}
            />
            <Question
              text="Do you prioritize completing the most challenging tasks first in your day?"
              selectedCircle={selectedCircle2}
              setSelectedCircle={setSelectedCircle2}
            />
            <Question
              text="Do you prefer to break up your workday with regular rest or low-intensity activities?"
              selectedCircle={selectedCircle3}
              setSelectedCircle={setSelectedCircle3}
            />
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
              <Text style={styles.btnText}>Next</Text>  
          </TouchableOpacity>
        </View>
        <ProgressBar currentPage={2} totalPages={4} />
      </View>

      <StatusBar style="auto" />
      <Toast/>
    </View>
  );
}

const styles = StyleSheet.create({
  fundal: {
    backgroundColor: '#2c1e33',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: '85%',
    height: '60%',
    backgroundColor: '#200f29',
    borderTopLeftRadius: '20%',
    borderTopRightRadius: 35,
    borderBottomRightRadius: '16%',
    borderBottomLeftRadius: 35,
  },
  text_box: {
    position: 'relative',
    top: normalizeHeight(50),
    left: normalizeWidth(20),
  },
  title: {
    color: 'white',
    fontSize: normalizeWidth(22),
    fontWeight: 'bold',
  },
  enter: {
    top: normalizeHeight(10),
    color: 'white',
    fontSize: normalizeWidth(10),
  },
  questions: {
    position: 'relative',
    top: normalizeHeight(50),
    left: -normalizeWidth(20),
    gap: normalizeHeight(30),
  },
  btn: {
    position: 'relative',
    top: normalizeHeight(190),
    width: '90%',
    backgroundColor: '#c987e6',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontSize: normalizeWidth(14),
    padding: 0,
  },
  
});
