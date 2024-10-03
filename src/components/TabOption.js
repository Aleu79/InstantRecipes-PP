import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TabOption = ({ label, selectedOption, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.tabButton, selectedOption ? styles.activeTab : styles.inactiveTab]}
      onPress={onSelect}
    >
      <Text style={styles.tabText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FF4500',
  },
  inactiveTab: {
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default TabOption;
