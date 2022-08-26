import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
    shadowColor: "#000000",
    shadowOffset: { width: 5, height: 5 },
    shadowRadius: 10,
    shadowOpacity: 0.2,
    elevation: 20, // android shadow enable
  },
  active: {
    backgroundColor: "#c6c6c6",
  },
  disabled: {
    backgroundColor: "#949494",
  },
  text: {
    color: "black",
    fontSize: 16,
  },
});

export default function Btn({ text, f, style, disabled = false }) {
  const [active, setActive] = useState(false);

  const touchStart = () => setActive(true);
  const touchEnd = () => {
    setActive(false);
    f?.(text);
  };

  return (
    <View
      style={[
        styles.btn,
        style,
        active && styles.active,
        disabled && styles.disabled,
      ]}
      onTouchEnd={!disabled && touchEnd}
      onTouchStart={!disabled && touchStart}
    >
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}
