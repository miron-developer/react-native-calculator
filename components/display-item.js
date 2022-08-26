import { useState } from "react";
import { StyleSheet, Text } from "react-native";

const styles = StyleSheet.create({
  text: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    fontSize: 25,
    color: "black",
  },
  active: {
    borderWidth: 1,
    borderColor: "#e8b2b2",
    borderRadius: 5,
    color: "red",
  },
});

export default function DisplayItem({
  id,
  value,
  type,
  style,
  activeElem,
  setActiveElem,
}) {
  const [active, setActive] = useState(activeElem?.id === id);

  const touchEnd = () => {
    setActive(!active);
    active ? setActiveElem(null) : setActiveElem({ value, id, type });
  };

  return (
    <Text
      style={[styles.text, style, active && styles.active]}
      onTouchEnd={touchEnd}
    >
      {value}
    </Text>
  );
}
