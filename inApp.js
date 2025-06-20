import React, { Component, useRef, useCallback, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, TouchableOpacity, TextInput, Image, FlatList } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { StatusBar } from 'react-native';
import { StatusBar as StatusBar2 } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Background from './razvam/Background';
import OpenAI from 'openai';
import Slider from '@react-native-community/slider';
import {onSnapshot, doc, getDoc, collection, getFirestore, addDoc, Timestamp, getDocs} from '@react-native-firebase/firestore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DatePicker from 'react-native-date-picker'
import Toast from 'react-native-toast-message';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {GoogleGenAI, Type} from "@google/genai"
import HowAreYouFeeling from './hayf';
db = getFirestore()
const BusyHoursModal = ({ modalRef, setBusy, tasksToBeArranged, addButtonRef }) => {
  const [busyHours, setBusyHours] = React.useState([8, 14]);
  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={['80%']}
      backgroundStyle={{ backgroundColor: '#200f29' }}
      handleIndicatorStyle={{ backgroundColor: '#decfb4' }}
      enableDynamicSizing={false}
    >
      <BottomSheetView style={{ padding: 20, alignItems: 'center' }}>
        <View style={{ backgroundColor: '#3a2a4e', borderRadius: 10, padding: 20, width: '100%' }}>
          <Text style={{ color: '#decfb4', marginBottom: 10, textAlign: 'center' }}>Select Busy Hours</Text>
          <Text style={{ color: '#decfb4', marginBottom: 10, textAlign: 'center' }}>
            {busyHours[0]}:00 - {busyHours[busyHours.length - 1]}:00
          </Text>
          <MultiSlider
            values={busyHours}
            sliderLength={300}
            onValuesChange={(values) => {
              console.log(values)
              setBusyHours([values[0], values[1]]);
            }}
            min={0}
            max={23}
            step={1}
            allowOverlap={false}
            snapped
            customMarker={(e) => {
              return (
                <View
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 20,
                    backgroundColor: '#c987e6',
                    borderWidth: 1,
                    borderColor: '#decfb4',
                  }}d
                />
              );
            }}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#c987e6',
              padding: 15,
              borderRadius: 5,
              alignItems: 'center',
              width: '100%',
              marginTop: 20,
            }}
            onPress={() => {
              setBusy(busyHours);
              console.log(busyHours);
              modalRef.current?.close();
            }}
          >
            <Text style={{ color: 'white' }}>Submit</Text>
          </TouchableOpacity>
        </View>
        <View style={{ backgroundColor: '#3a2a4e', borderRadius: 10, padding: 20, width: '100%', marginTop: 20 }}>
          <Text style={{ color: '#decfb4', marginBottom: 10, textAlign: 'center' }}>Tasks to be arranged</Text>
          <FlatList
            data={tasksToBeArranged}
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 10, borderBottomColor: '#decfb4', borderBottomWidth: 1 }}>
                <Text style={{ color: '#decfb4' }}>{item.description}</Text>
                <Text style={{ color: '#decfb4' }}>{new Date(item.dueDate).toLocaleDateString('en-GB')}</Text>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
              <Pressable
        style={({ pressed }) => [
          {
            position: 'absolute',
            right: 20,
            bottom: 20,
            backgroundColor: '#c987e6',
            padding: 15,
            borderRadius: 50,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={addButtonRef}
      >
        <Ionicons name="add" size={24} color="white" />
      </Pressable>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const NewTaskModal = ({ modalRef }) => {
  const [date, setDate] = React.useState(new Date());
  const [open, setOpen] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [difficulty, setDifficulty] = React.useState(5);
  const [priority, setPriority] = React.useState(5);
  const [duration, setDuration] = React.useState('');

  const sliderRef = useRef(null);

  return (
    <BottomSheetModal
      ref={modalRef}
      snapPoints={['95%']}
      backgroundStyle={{ backgroundColor: '#200f29' }}
      handleIndicatorStyle={{ backgroundColor: '#decfb4' }}
      enableDynamicSizing={false}
    >
      <BottomSheetView style={{ padding: 20 }}>
        <Text style={{ color: '#decfb4', marginBottom: 10 }}>Task Description</Text>
        <TextInput
          style={{
            height: 40,
            borderColor: '#decfb4',
            borderWidth: 1,
            borderRadius: 5,
            color: '#decfb4',
            paddingHorizontal: 10,
            marginBottom: 20,
            width: '100%',
          }}
          placeholder="Enter task description"
          placeholderTextColor="#decfb4"
          onChangeText={setDescription}
        />
        <Pressable
          style={({ pressed }) => [
            {
              height: 40,
              borderColor: '#decfb4',
              borderWidth: 1,
              borderRadius: 5,
              color: '#decfb4',
              paddingHorizontal: 10,
              marginBottom: 20,
              width: '100%',
              justifyContent: 'center',
            },
          ]}
          onPress={() => {
            setOpen(true);
          }}
        >
          <Text style={{ color: '#decfb4' }}>{date.toISOString().split('T')[0]}</Text>
        </Pressable>

        <DatePicker
          modal
          open={open}
          date={date}
          onConfirm={(date) => {
            setOpen(false);
            setDate(date);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
        <Text style={{ color: '#decfb4', marginBottom: 10 }}>Task Difficulty</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#decfb4', marginRight: 10 }}>Low</Text>
          <NativeViewGestureHandler disallowInterruption={true}>
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={0}
              maximumValue={10}
              value={difficulty}
              onValueChange={setDifficulty}
              minimumTrackTintColor="#c987e6"
              maximumTrackTintColor="#decfb4"
              ref={sliderRef}
            />
          </NativeViewGestureHandler>
          <Text style={{ color: '#decfb4', marginLeft: 10 }}>High</Text>
        </View>
        <Text style={{ color: '#decfb4', marginBottom: 10 }}>Task Priority</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ color: '#decfb4', marginRight: 10 }}>Low</Text>
          <NativeViewGestureHandler disallowInterruption={true}>
            <Slider
              style={{ flex: 1, height: 40 }}
              minimumValue={0}
              maximumValue={10}
              value={priority}
              onValueChange={setPriority}
              minimumTrackTintColor="#c987e6"
              maximumTrackTintColor="#decfb4"
              ref={sliderRef}
            />
          </NativeViewGestureHandler>
          <Text style={{ color: '#decfb4', marginLeft: 10 }}>High</Text>
        </View>
        <Text style={{ color: '#decfb4', marginBottom: 10 }}>Aprox. Task Duration (hours)</Text>
        <TextInput
          style={{
            height: 40,
            borderColor: '#decfb4',
            borderWidth: 1,
            borderRadius: 5,
            color: '#decfb4',
            paddingHorizontal: 10,
            marginBottom: 20,
            width: '100%',
          }}
          placeholder="Enter task duration"
          placeholderTextColor="#decfb4"
          keyboardType="numeric"
          onChangeText={setDuration}
        />
        <TouchableOpacity
          style={{
            backgroundColor: '#c987e6',
            padding: 15,
            borderRadius: 5,
            alignItems: 'center',
            width: '100%',
          }}
          onPress={() => {
            const userId = auth().currentUser.uid;
            
            addDoc(collection(db, "users", userId, "tasks"), {
                description:description,
                difficulty: difficulty/10,
                importance: priority/10,
                duration:duration,
                dueDate: Timestamp.fromDate(date),
              })
              .then(() => {
                Toast.show({
                  type:"info",
                  text1:"Task adaugat!"
                })
                modalRef.current?.close();
              });
          }}
        >
          <Text style={{ color: 'white' }}>Submit</Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split('T')[0];
};

const AgendaScreen = () => {
  const [items, setItems] = React.useState({});
  const [tasksToBeArranged, setTasksToBeArranged] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [busyHours, setBusyHours] = React.useState([8, 14]);
  const [sleepHours, setSleepHours] = React.useState([23, 6]);
  const currentDate = new Date().toLocaleDateString('en-GB').split('/').reverse().join('-');
  const [selectedDate, setSelectedDate] = React.useState(currentDate);
  const bottomSheetModalRef = useRef(null);
  const bottomSheetModalRef2 = useRef(null);
  const loadedMonths = useRef([]);
  const handlePresentModalPress = () => {
    bottomSheetModalRef.current?.present();
  };
  const handleSheetChanges = (index) => {
    console.log('handleSheetChanges', index);
  };
  const handlePresentModalPress2 = () => {
    bottomSheetModalRef2.current?.present();
  };
  const handleSheetChanges2 = (index) => {
    console.log('handleSheetChanges2', index);
  };

  const GEMINI_API_KEY = "AIzaSyC1clS6dlnxagGHxNkI3fEkTq84WMNPhkA"
  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const energyLevelJSON = `\n{ \"title\": \"Average Hourly Energy Levels\", \"xAxisLabel\": \"Hour\", \"yAxisLabel\": \"Energy Level\", \"data\": [ {\"hour\": 7, \"energyLevel\": 2.5}, {\"hour\": 8, \"energyLevel\": 3.2}, {\"hour\": 9, \"energyLevel\": 3.5}, {\"hour\": 10, \"energyLevel\": 3.8}, {\"hour\": 11, \"energyLevel\": 3.7}, {\"hour\": 12, \"energyLevel\": 3.5}, {\"hour\": 13, \"energyLevel\": 3.2}, {\"hour\": 14, \"energyLevel\": 1.8}, {\"hour\": 15, \"energyLevel\": 2.0}, {\"hour\": 16, \"energyLevel\": 2.3}, {\"hour\": 17, \"energyLevel\": 2.5}, {\"hour\": 18, \"energyLevel\": 3.2}, {\"hour\": 19, \"energyLevel\": 3.4}, {\"hour\": 20, \"energyLevel\": 3.7}, {\"hour\": 21, \"energyLevel\": 3.0}, {\"hour\": 22, \"energyLevel\": 2.5}, {\"hour\": 23, \"energyLevel\": 2.0}, {\"hour\": 0, \"energyLevel\": 1.5}, ], \"peak\": { \"start\": 7.5, \"end\": 12.5, \"label\": \"PEAK (7:30 AM - 12:30 PM): Ideal for complex tasks requiring focus and concentration.\" }, \"trough\": { \"start\": 13, \"end\": 15, \"label\": \"TROUGH (1:00 PM - 5:00 PM): Rest, recharge, or engage in low-intensity activities.\" }, \"rebound\": { \"start\": 17.5, \"end\": 20.5, \"label\": \"REBOUND (5:30 PM - 8:30 PM): Suitable for creative tasks or those requiring less intense focus.\" }, \"late_night\": { \"start\": 21, \"end\": 1, \"label\": \"LATE NIGHT (9:00 PM - 1:00 AM): Wind down, relax, and prepare for sleep.\" } }`
  const prompt = `
  Role:
You are an advanced time management assistant.

Objective:
Your primary objective is to create an optimized daily schedule by reordering and assigning time slots for a given list of tasks. The schedule must be based on the user's personal energy levels throughout the day, as detailed in the provided JSON data.

Input Data:
You will be provided with the following information:

Task List: A list of tasks with the following attributes for each:

Task Name: A brief description of the task.
Importance: The priority level of the task (e.g., High, Medium, Low).
Difficulty: The complexity of the task (e.g., Hard, Medium, Easy).
Time Cost (in hours): The estimated duration to complete the task.
User-Defined Busy Hours: A list of time slots during which no tasks can be scheduled. Take into account the lenght of the busy hours, not just the start and end times. Do not schedule any tasks during these hours. Do not overlap with these hours.

Hourly Energy Level JSON: A JSON object that maps each hour of the day to an energy level and a corresponding period category. The categories and their suitability for different task types are as follows:

PEAK: Ideal for the most demanding and important tasks.
REBOUND: Suitable for moderately difficult or important tasks.
TROUGH: Best for simple, low-energy tasks.
LATE NIGHT: Reserved for optional or low-priority activities.
Scheduling Rules & Constraints:
You must adhere to the following rules when creating the schedule:
Tasks must always start at the beginning of an hour (e.g., 9:00, 10:00).
No Overlapping Tasks: Each task must have a unique, dedicated time slot.
Adherence to Busy Hours: No tasks shall be scheduled during the user-specified busy hours.
Task Duration Calculation: All task durations must be rounded up to the nearest whole hour (e.g., a 2.3-hour task should be scheduled for 3 hours).
Energy-Based Task Placement:
Schedule the most difficult and important tasks during PEAK energy periods.
Use REBOUND periods for tasks of medium difficulty and importance.
Assign the least difficult tasks to TROUGH periods.
Task Distribution:
Whenever possible, distribute tasks across multiple days to avoid over-scheduling and user burnout.
If multiple tasks are scheduled for the same day, alternate between high-difficulty and low-difficulty tasks to maintain a balanced cognitive load.
Output Format:
The final output should be a clearly structured schedule, organized by day. For each day, provide a chronological list of scheduled tasks, including:

Start Time
End Time
Task Name
Assigned Energy Period (PEAK, REBOUND, TROUGH, LATE NIGHT)
Example Output Structure:

Monday

09:00 - 11:00: Task A (PEAK)
14:00 - 15:00: Task B (TROUGH)
Tuesday

10:00 - 12:00: Task C (PEAK)
`
const systemPrompt = prompt + energyLevelJSON;
const handleiaiai = async () => {
    console.log(Array.from({ length: busyHours[1] - busyHours[0] + 1 }, (_, i) => i + busyHours[0]))
    setLoading(true);
    const userPrompt = {
      tasks: tasksToBeArranged,
      userData: { busyHours: Array.from({ length: busyHours[1] - busyHours[0] + 1 }, (_, i) => i + busyHours[0]), sleepHours: [23, 0, 1, 2, 3, 4, 5, 6] },
      environmentData: { currentDate: currentDate, currentTime: new Date().getHours() }
    };
    try {
      const result = await genAI.models.generateContent({
        model:"gemini-2.5-flash-lite-preview-06-17",
        contents: JSON.stringify(userPrompt),
        config: {
          thinkingConfig: {
            thinkingBudget: 512,
          },
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              tasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    difficulty: { type: Type.NUMBER },
                    importance: { type: Type.NUMBER },
                    duration: { type: Type.NUMBER },
                    dueDate: { type: Type.STRING },
                    optimalHour: { type: Type.INTEGER },
                    energyLevel: { type: Type.NUMBER },
                    optimalDate: { type: Type.STRING },
                  },
                  required: ["description", "difficulty", "importance", "duration", "dueDate", "optimalHour", "energyLevel", "optimalDate"],
                },
              },
            },
          },
        },
      });
      console.log(result.candidates[0].content["parts"][0].text);
      const responseText = result.candidates[0].content["parts"][0].text

      let parsedResponse;
      parsedResponse = JSON.parse(responseText);
    

      const updatedTasks = parsedResponse.tasks.sort((a, b) => a.optimalHour - b.optimalHour);
      const newItems = {};
      for (let i = -15; i < 85; i++) {
        const time = new Date(currentDate).getTime() + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        newItems[strTime] = [];
      }
      let newSelectedDate = currentDate;
      updatedTasks.forEach(task => {
        const date = task.optimalDate.split('/').reverse().join('-');
        if (!newItems[date]) {
          newItems[date] = [];
        }
        newItems[date].push({
          description: task.description,
          difficulty: task.difficulty,
          importance: task.importance,
          duration: task.duration,
          optimalHour: task.optimalHour,
          energyLevel: task.energyLevel,
          dueDate: new Date(task.dueDate.split('/').reverse().join('-')).toISOString(),
        });
        if (!newSelectedDate || new Date(date) < new Date(newSelectedDate)) {
          newSelectedDate = date;
        }
      });
      setItems(newItems);
      const userId = auth().currentUser.uid;
      const timestamp = Timestamp.now();
      
      // First get all existing ordered tasks for this user
      const orderedTasksRef = collection(db, "users", userId, "orderedTasks");
      
      // We need to import getDocs and updateDoc at the top of the file
      // import { getDocs, updateDoc } from '@react-native-firebase/firestore';
      
      getDocs(orderedTasksRef).then((querySnapshot) => {
        const existingTasks = {};
        querySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          // Use description as key to identify tasks
          existingTasks[data.description] = { id: docSnapshot.id, ...data };
        });
        
        // Process each task in newItems
        Object.keys(newItems).forEach(date => {
          if (newItems[date] && newItems[date].length > 0) {
        newItems[date].forEach(task => {
          if (existingTasks[task.description]) {
            // Task exists, update it
            const docId = existingTasks[task.description].id;
            const docRef = doc(db, "users", userId, "orderedTasks", docId);
            updateDoc(docRef, {
          difficulty: task.difficulty,
          importance: task.importance,
          duration: task.duration,
          dueDate: task.dueDate,
          optimalHour: task.optimalHour,
          energyLevel: task.energyLevel,
          scheduledDate: date,
          updatedAt: timestamp
            });
          } else {
            // Task doesn't exist, create it
            addDoc(collection(db, "users", userId, "orderedTasks"), {
          description: task.description,
          difficulty: task.difficulty,
          importance: task.importance,
          duration: task.duration,
          dueDate: task.dueDate,
          optimalHour: task.optimalHour,
          energyLevel: task.energyLevel,
          scheduledDate: date,
          createdAt: timestamp
            });
          }
        });
          }
        });
      });
      setSelectedDate(newSelectedDate);
      console.log(newItems);
    } catch (error) {
      console.log(error);
      setLoading(false);
      Alert.alert("Error", "Failed to generate schedule. Please try again.");
    } finally {
      setLoading(false);
    }
  }
useEffect(() => {
  const newItems = {};
  const today = new Date();
  for (let i = -15; i < 85; i++) {
    const time = today.getTime() + i * 24 * 60 * 60 * 1000;
    const strTime = timeToString(time);
    if (!newItems[strTime]) {
      newItems[strTime] = [];
    }
  }
  setItems(newItems);
}, []);
const loadItems = useCallback((day) => {
  const month = day.dateString.substring(0, 7);
  if (loadedMonths.current.includes(month)) {
    return;
  }
  loadedMonths.current.push(month);
  setTimeout(() => {
    setItems((prevItems) => {
      const newItems = { ...prevItems };
        for (let i = -15; i < 85; i++) {
          const time = day.timestamp + i * 24 * 60 * 60 * 1000;
          const strTime = timeToString(time);
          if (!newItems[strTime]) {
            newItems[strTime] = [];
          }
        }
        return newItems;
      });
    }, 1000);
  }, []);
  useEffect(() => {
    const userId = auth().currentUser.uid;
    const coll = collection(db, "users", userId, "tasks")
    const unsubscribe = onSnapshot(coll, querySnapshot => {
        const tasks = [];
        console.log("nigga")
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const date = data.dueDate.toDate().toISOString()
          console.log(date);
          tasks.push({
            description:data.description,
            difficulty:data.difficulty,
            importance:data.importance,
            duration:data.duration,
            dueDate:date,
            name:data.name
        });
        });
        setTasksToBeArranged(tasks);
      });

    return () => unsubscribe();
  }, []);
  const renderItem = useCallback((reservation) => {
    return (
      <Pressable style={[styles.item, { height: 100 }]} onPress={() => { Alert.alert('Task Details', `Description: ${reservation.description}\nDifficulty: ${reservation.difficulty}\nImportance: ${reservation.importance}\nDuration: ${reservation.duration}\nEnergyLevel: ${reservation.energyLevel}`) }}>
      <Text>{reservation.optimalHour}:00 - {reservation.optimalHour + Math.ceil(reservation.duration)}:00</Text>
      <Text>{reservation.description}</Text>
      <Text>Due Date: {new Date(reservation.dueDate).toLocaleDateString('en-GB')} {new Date(reservation.dueDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Text>
      </Pressable>
    );
  }, []);

  const renderEmptyDate = useCallback(() => {
    return (
      <View style={styles.emptyDate}>
        <View style={{ borderBottomColor: 'gray', borderBottomWidth: 1, marginVertical: 10 }} />
      </View>
    );
  }, []);

  const rowHasChanged = useCallback((r1, r2) => {
    return r1.name !== r2.name;
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: '#493155' }}>
      <Agenda
        items={items}
        selected={selectedDate}
        renderItem={renderItem}
        loadItemsForMonth={loadItems}
        renderEmptyDate={renderEmptyDate}
        rowHasChanged={rowHasChanged}
        theme={{
          agendaDayTextColor: '#decfb4',
          agendaDayNumColor: '#decfb4',
          agendaTodayColor: '#c987e6',
          agendaKnobColor: '#decfb4',
          calendarBackground: '#493155',
          calendarDayTextColor: '#decfb4',
          reservationsBackgroundColor: "#110915",
          textSectionTitleColor: '#decfb4',
          selectedDayBackgroundColor: '#c987e6',
          textSectionTitleDisabledColor: '#d9e1e8',
          dayTextColor: '#decfb4',
          monthTextColor: "#decfb4",
        }}
      />
      <Pressable
        style={({ pressed }) => [
          {
            position: 'absolute',
            left: 20,
            bottom: 20,
            backgroundColor: '#c987e6',
            padding: 15,
            borderRadius: 50,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={() => handleiaiai()}
      >
        <MaterialCommunityIcons name="star-four-points-outline" size={24} color="#AACCEE" />
      </Pressable>
      <Pressable
        style={({ pressed }) => [
          {
            position: 'absolute',
            right: 20,
            bottom: 20,
            alignSelf: 'center',
            backgroundColor: '#c987e6',
            padding: 15,
            borderRadius: 50,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
        onPress={handlePresentModalPress2}
      >
        <Ionicons name="time" size={24} color="white" />
      </Pressable>
      <NewTaskModal modalRef={bottomSheetModalRef} />
      <BusyHoursModal modalRef={bottomSheetModalRef2} setBusy={setBusyHours} tasksToBeArranged={tasksToBeArranged} addButtonRef={handlePresentModalPress} />
      {loading && (<View style={{position:"absolute", width:"100%", height:"100%", backgroundColor:"rgba(0, 0, 0, 0.9)", flex:1, justifyContent:"center", alignItems:"center", zIndex:999}}>
        <Image source={require('./assets/iaiai.gif')} style={{width:50, height:50}} />
      </View>)}
      <HowAreYouFeeling/>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30
  }
});

    function handleMenuPress(text) {
      if (text === 'Log Out') {
        auth().signOut();
      }else if(text === 'Subscriptions') {
        handlePresentModalPress();
      }
  }


const Btn = ({text, fun = undefined}) => {
  return(
    <TouchableOpacity style={settingsStyles.btn} onPress={fun?fun:()=>{handleMenuPress(text)}}>
      <Text style={settingsStyles.btn_txt}> {text} </Text>
    </TouchableOpacity>
  )
}

function SettingsTab() {
  const bottomSheetModalRef = useRef(null);
  const bottomSheetModalRef2 = useRef(null);
  const handlePresentModalPress = () => {
    bottomSheetModalRef.current?.present();
  };
  const handlePresentModalPress2 = () => {
    bottomSheetModalRef2.current?.present();
  };

  
  return (
    <View style={settingsStyles.fundal}>
      <Background />
      <View style={settingsStyles.menu}>
        <Image source={require('./assets/logo.png')} style={{width: 50, height: 50, alignSelf: 'center', marginTop: 30,}}/>
        <View style={settingsStyles.btn_container}>
          <Btn text='About Us'/>
          <Btn text='Contact Us'/>
          <Btn text='Report a bug' fun={handlePresentModalPress2}/>
          <Btn text='Subscriptions' fun={handlePresentModalPress}/>
          <Btn text='Log Out'/>
        </View>
      </View>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={['95%']}
        backgroundStyle={{ backgroundColor: '#200f29' }}
        handleIndicatorStyle={{ backgroundColor: '#decfb4' }}
      >
        <BottomSheetView style={{height:"100%"}}>

        
          <Subscriptions></Subscriptions>
        </BottomSheetView>
      </BottomSheetModal>
      <BottomSheetModal
        ref={bottomSheetModalRef2}
        snapPoints={['95%']}
        backgroundStyle={{ backgroundColor: '#200f29' }}
        handleIndicatorStyle={{ backgroundColor: '#decfb4' }}
      >
        <BottomSheetView style={{height:"100%"}}>
          <Rab reff={bottomSheetModalRef2}/>
          </BottomSheetView>
      </BottomSheetModal>
    </View>
  );
}


const settingsStyles = StyleSheet.create({
  fundal: {
    backgroundColor: '#2c1e33',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    width: '85%',
    height: '70%',
    backgroundColor: '#200f29',
    borderRadius: 30,
    display: 'flex',
  },
  btn_container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '90%',
    gap: 20,
  },
  btn: { 
    width: '60%',
    height: '8%',
    backgroundColor: '#2c1e33',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  btn_txt: {
    color: 'white',
    fontSize: 12,
  },
  menu2: {
    width: '100%',
    height: '70%',
    borderRadius: 30,
    marginVertical: 10,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 30,
      marginBottom: 50,
  },
  container: {
      width: '90%',
      height: '38%',
      backgroundColor: '#200f29',
      borderRadius: 30,
  },

  pricing: {
    top: 25,
    alignSelf: 'center',
    color: 'white',
    fontSize: 17,
  },
  price: {
      top: 60,
    color: 'white',
    alignSelf: 'center',
    fontSize: 30,
  },
  price_save: {
      top: 70,
      color: 'white',
      alignSelf: 'center',
      fontSize: 12,
  },
  fatf: {
      position: 'absolute',
      bottom: 10,
      color: 'white',
      alignSelf: 'center',
      fontSize: 11,
      },

  features_title: {
    color: 'white',
    fontSize: 20,
      left: 20,
      top: 20,

  },
  features: {
      display: 'flex',
      flexDirection: 'column',
      top: 40,
      gap: 5,
      left: 40,
  },
  feature: {
    color: 'white',
    fontSize: 15,
  },

});


function Subscriptions() {
  return (
    <View style={settingsStyles.fundal}>
      <Background />
      <View style={settingsStyles.menu2}>
              <TouchableOpacity style={settingsStyles.container}>
                  <Text style={settingsStyles.pricing}>Monthly Subscription</Text>
                  <Text style={settingsStyles.price}>5.49€</Text>
                  <Text style={settingsStyles.price_save}>(Free trial 14 days)</Text>
                  <Text style={settingsStyles.fatf}>For all the features</Text>
              </TouchableOpacity>  
              <TouchableOpacity style={settingsStyles.container}>
                  <Text style={settingsStyles.pricing}>Yearly Subscription</Text>
                  <Text style={settingsStyles.price}>49.99€</Text>
                  <Text style={settingsStyles.price_save}>(Save 10%)</Text>
                  <Text style={settingsStyles.fatf}>For all the features</Text>
              </TouchableOpacity>
          <View style={settingsStyles.container}>
              <Text style={settingsStyles.features_title}>Features include:</Text>
              <View style={settingsStyles.features}>
                  <Text style={settingsStyles.feature}>• Automatic task scheduling</Text>
                  <Text style={settingsStyles.feature}>• Task prioritisation</Text>
                  <Text style={settingsStyles.feature}>• Integration with the Health App</Text>
                  <Text style={settingsStyles.feature}>• Planning based on how you are feeling</Text>
                  <Text style={settingsStyles.feature}>• Habit adaptation</Text>
              </View>
          </View>
        </View>
    </View>
  );
}

const rabStyles = StyleSheet.create({
  fundal: {
    backgroundColor: '#2c1e33',
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    height: '50%',
    backgroundColor: '#200f29',
    borderRadius: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: '40%',
    backgroundColor: '#2c1e33',
    color: 'grey',
    fontSize: 16,
    padding: 10,
    borderRadius: 20,
    color: 'white',
  },
  btn: {
    width: '40%',
    height: '10%',
    backgroundColor: '#c987e6',
    padding: 0,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    padding: 0,
  },
});

const Rab = ({reff}) => {
  return(
      <View style={rabStyles.fundal}>
          <Background />
          <View style={rabStyles.container}>
              <Text style={rabStyles.title}>Raport a bug!</Text>
              <TextInput 
                  style={rabStyles.input} 
                  placeholder="Descrie bug-ul aici..." 
                  placeholderTextColor="grey"
                  multiline={true}
                  textAlignVertical="top"
              />
              <TouchableOpacity style={rabStyles.btn} onPress={()=>{Toast.show({type:"success", text1:"Thank you for reporting a bug!"}); reff.current?.close()}}>
                  <Text style={rabStyles.btnText}>Send</Text>
              </TouchableOpacity>
          </View>
      </View>
  );
};

const Tab = createBottomTabNavigator();

function App() {
  return (
    <NavigationContainer>
      <StatusBar2 style="light" />
      <View style={{ flex: 1, paddingTop: StatusBar.currentHeight, backgroundColor: "#493155" }}>
        <Tab.Navigator
          initialRouteName="Agenda"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'Agenda') {
                iconName = 'calendar-clear';
              }
              else if (route.name === 'Settings') {
                iconName = 'settings';
              }
              return <Ionicons name={iconName} size={size} color={color} />;

            },
            tabBarStyle: { backgroundColor: '#493155' }
          })}
        >
          <Tab.Screen name="Agenda" component={AgendaScreen} options={{ tabBarActiveTintColor: '#c987e6' }} />
          <Tab.Screen name="Settings" component={SettingsTab} options={{ tabBarActiveTintColor: '#c987e6' }} />
        </Tab.Navigator>
          <Toast />
      </View>
    </NavigationContainer>
  );
}

export default App;
