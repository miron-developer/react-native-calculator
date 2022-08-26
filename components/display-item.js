import { StyleSheet, Text } from "react-native";

const styles = StyleSheet.create({
  text: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    fontSize: 25,
    color: "black",
  },
});

export default function DisplayItem({ id, value, type, style }) {
  return <Text style={[styles.text, style]}>{value}</Text>;
}
