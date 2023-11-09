import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Text } from "react-native";
import axios from "axios";
import { API_KEY } from "@env";
import { fetchExercisesByUser } from "../services/ExerciseByUser";
import ExerciseCard from "../components/ExerciseCards";
import { SearchBar } from "@rneui/themed";
import RNPickerSelect from "react-native-picker-select";
import Sort from "../components/Sort";

const bodyParts = [
  "back",
  "cardio",
  "chest",
  "lower arms",
  "lower legs",
  "shoulders",
  "upper arms",
  "upper legs",
  "waist",
];

const MyExercisesScreen = ({ navigation }) => {
  const [userExercises, setUserExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState("");
  const [sortingValue, setSortingValue] = useState("");
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserExercisesDetails = async () => {
      setLoading(true);
      try {
        const userExerciseIds = await fetchExercisesByUser();

        const exercisesDetails = await Promise.all(
          userExerciseIds.map(async (exerciseId) => {
            const response = await axios.get(
              `https://exercisedb.p.rapidapi.com/exercises/exercise/${exerciseId}`,
              {
                headers: {
                  "X-RapidAPI-Key": API_KEY,
                  "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
                },
              }
            );
            return response.data;
          })
        );

        setUserExercises(exercisesDetails);
        setFilteredExercises(exercisesDetails);
      } catch (error) {
        console.error(
          "There was an error fetching the user's exercise details:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserExercisesDetails();
  }, []);

  const sortExercises = (exercises, sortValue) => {
    return [...exercises].sort((a, b) => {
      if (sortValue === "Name A-Z") {
        return a.name.localeCompare(b.name);
      } else if (sortValue === "Name Z-A") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });
  };

  useEffect(() => {
    let updatedFilteredExercises = userExercises;

    if (selectedBodyPart) {
      updatedFilteredExercises = updatedFilteredExercises.filter(
        (exercise) =>
          exercise.bodyPart.toLowerCase() === selectedBodyPart.toLowerCase()
      );
    }

    if (search) {
      updatedFilteredExercises = updatedFilteredExercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortingValue) {
      updatedFilteredExercises = sortExercises(
        updatedFilteredExercises,
        sortingValue
      );
    }

    setFilteredExercises(updatedFilteredExercises);
  }, [selectedBodyPart, search, sortingValue, userExercises]);

  const updateSearch = (search) => {
    setSearch(search);
  };

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder='Search here...'
        onChangeText={updateSearch}
        value={search}
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.inputContainer}
      />
      <RNPickerSelect
        onValueChange={(value) => setSelectedBodyPart(value)}
        items={bodyParts.map((part) => ({ label: part, value: part }))}
        style={pickerSelectStyles}
        placeholder={{ label: "Select a body part", value: null }}
      />
      <Sort
        value={sortingValue}
        onChange={setSortingValue}
      />
      <FlatList
        data={filteredExercises}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            navigation={navigation}
          />
        )}
        keyExtractor={(item) => String(item.id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
  },
  searchContainer: {
    backgroundColor: "lightgrey",
    borderBottomColor: "transparent",
    borderTopColor: "transparent",
    padding: 10,
  },
  inputContainer: {
    backgroundColor: "white",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30,
    backgroundColor: "white",
    marginTop: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "purple",
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "white",
    marginTop: 10,
  },
});

export default MyExercisesScreen;