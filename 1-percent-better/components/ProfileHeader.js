import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { fetchUsernameByUserId } from "../services/userService";
import { useUserContext } from "../context/UserContext";

const ProfileHeader = () => {
  const [username, setUsername] = useState("Loading..."); // default state while loading
  const { user } = useUserContext();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const fetchedUsername = await fetchUsernameByUserId(user);
        setUsername(fetchedUsername);
      } catch (error) {
        console.error("Error fetching username: ", error);
        setUsername("Error");
      }
    };

    fetchUsername();
  }, [user]);

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://loremflickr.com/150/150" }} // Placeholder image
        style={styles.avatar}
      />
      <Text style={styles.username}>{`${username}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FFFFFF",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileHeader;
