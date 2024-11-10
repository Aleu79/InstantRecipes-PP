import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DietDetails = ({ iconName, color, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handlePress = () => {
    setShowTooltip(!showTooltip); 
  };

  return (
    <View style={styles.dietDetail}>
      <TouchableOpacity onPress={handlePress}>
        <MaterialCommunityIcons name={iconName} size={24} color={color} />
      </TouchableOpacity>

      {/* Tooltip solo debajo */}
      {showTooltip && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dietDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  tooltip: {
    position: "absolute",
    top: "100%",
    left: "100%",
    marginTop: 5,
    transform: [{ translateX: -50 }],
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#333",
    borderRadius: 5,
    zIndex: 1,
  },
  tooltipText: {
    color: "#fff",
    fontSize: 12,
  },
});

export default DietDetails;
