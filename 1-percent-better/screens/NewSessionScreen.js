import React, { useState, useEffect, useContext } from "react";
import { useUserContext } from "../context/UserContext";
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  Modal,
  Button,
  ScrollView,
} from "react-native";

import { createSession } from "../services/createSession";
import {
  backgroundColor,
  primaryColor,
  secondaryColor,
  accentColor,
  callToActionColor,
} from "../components/ColorPallette";
import { useNavigation } from "@react-navigation/native";
import { addExerciseToSession } from "../services/addExerciseToSession";
import { logWorkout } from "../services/logWorkout";

const NewSessionScreen = ({ route }) => {
  const { user } = useUserContext();
  const [sessionName, setSessionName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]);
  const navigation = useNavigation();
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (route.params?.selectedExercises) {
      const exercisesWithDetails = route.params.selectedExercises.map(
        (exercise) => ({
          ...exercise,
          sets: "",
          reps: "",
          weight: "",
        })
      );
      setSelectedExercises(exercisesWithDetails);
    }
  }, [route.params?.selectedExercises]);

  const handleSaveSession = async () => {
    if (!sessionName) {
      Alert.alert("Error", "Please enter a session name.");
      return;
    }
    try {
      const newSession = await createSession(user, sessionName);
      setSessionId(newSession.sessionId);
      Alert.alert("Success", `Session ${newSession.sessionName} created`);

      // Navigate to AddExerciseScreen with the sessionId
      navigation.navigate("AddExerciseScreen", {
        sessionId: newSession.sessionId,
      });
    } catch (error) {
      console.error("Error creating session:", error);
      Alert.alert("Error", "Failed to create session");
    }
  };

  const handleExerciseDetailChange = (id, field, value) => {
    const updatedExercises = selectedExercises.map((exercise) => {
      if (exercise.id === id) {
        return { ...exercise, [field]: value };
      }
      return exercise;
    });
    setSelectedExercises(updatedExercises);
  };

  const handleSaveExercise = async (exercise) => {
    if (!sessionId) {
      Alert.alert(
        "Error",
        "Session ID is not available. Please save the session first."
      );
      return;
    }

    try {
      await addExerciseToSession(sessionId, exercise);
      Alert.alert("Success", `Exercise ${exercise.name} added to session.`);
    } catch (error) {
      console.error("Error saving exercise to session:", error);
      Alert.alert("Error", "Failed to add exercise to session");
    }
  };

  const handleFinishSession = async () => {
    try {
      for (const exercise of selectedExercises) {
        await logWorkout(exercise);

        navigation.navigate("MySessionsScreen");
      }
      Alert.alert("Success", "Session workouts logged successfully.");
      // Additional logic after logging all workouts
    } catch (error) {
      console.error("Error finishing session:", error);
      Alert.alert("Error", "Failed to log one or more workouts");
    }
  };

  const handleLeaveSession = () => {
    // Navigate to the Home screen
    navigation.navigate("Home");
  };

  const renderExercise = ({ item }) => (
    <View style={styles.exerciseContainer}>
      <Text style={styles.exerciseName}>{item.name}</Text>
      <Image source={{ uri: item.gifUrl }} style={styles.exerciseImage} />
      <TextInput
        style={styles.input}
        onChangeText={(value) =>
          handleExerciseDetailChange(item.id, "sets", value)
        }
        value={item.sets}
        placeholder="Sets"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={(value) =>
          handleExerciseDetailChange(item.id, "reps", value)
        }
        value={item.reps}
        placeholder="Reps"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        onChangeText={(value) =>
          handleExerciseDetailChange(item.id, "weight", value)
        }
        value={item.weight}
        placeholder="Weight"
        keyboardType="numeric"
      />
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="Save session"
        style={styles.saveButton}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.sessionInputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Session Name"
          value={sessionName}
          onChangeText={setSessionName}
        />
        <Button
          title="Save Session"
          onPress={handleSaveSession}
          color="#4CAF50"
        />
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={() => {
            if (sessionId) {
              navigation.navigate("AddExerciseScreen", {
                sessionId: sessionId,
              });
            } else {
              Alert.alert("Error", "Please create a session first.");
            }
          }}
        >
          <Text style={styles.button}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={selectedExercises}
        renderItem={renderExercise}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleFinishSession}
        >
          <Text style={styles.saveButtonText}>Finish Session</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.leaveSessionButton}
          onPress={handleLeaveSession}
        >
          <Text style={styles.leaveSessionButtonText}>Leave Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "left",
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  button: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
  },
  sessionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },

  exerciseImage: {
    width: 100, // Adjust as needed
    height: 100, // Adjust as needed
    resizeMode: "contain", // Or 'cover'
  },

  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  exerciseContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10, // Spacing between name and image
  },
  exerciseImage: {
    width: 80, // Adjust as needed
    height: 80, // Adjust as needed
    resizeMode: "cover", // Or 'contain'
    borderRadius: 5, // Optional: if you want rounded corners for the image
    alignSelf: "center", // Center the image
    marginBottom: 10, // Spacing between image and inputs
  },
  exerciseImage: {
    width: 80, // Adjust as needed
    height: 80, // Adjust as needed
    resizeMode: "cover", // Or 'contain'
    borderRadius: 5, // Optional: if you want rounded corners for the image
  },
  input: {
    flex: 1, // Ensures inputs take equal space
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: 5, // Adds vertical spacing
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: "#27AE60",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: "flex-start", // Aligns button to the start of the flex container
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  leaveSessionButton: {
    backgroundColor: "#E60701", // Red color for the leave button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 0,
    alignSelf: "flex-end", // Center the button
    padding: "auto",
    marginLeft: 120,
  },
  leaveSessionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
export default NewSessionScreen;
