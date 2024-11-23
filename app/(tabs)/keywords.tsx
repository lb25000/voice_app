import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CommonStyles from '../commonStyles';

const Keywords = () => {
  return (
    <View style={CommonStyles.container}>
      <View style={styles.grid}>
        <View style={styles.tile}>
          <Text style={styles.tileText}>Home</Text>
          <Text style={styles.tileDescription}>navigates to this tab</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileText}>Key Words</Text>
          <Text style={styles.tileDescription}>navigates to this tab</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileText}>New Form</Text>
          <Text style={styles.tileDescription}>navigates to this tab</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileText}>Save</Text>
          <Text style={styles.tileDescription}>saves a new entry within the new form tab and opens a new form </Text>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', //space-around',
  },
  tile: {
    width: 140,
    height: 140,
    backgroundColor: '#f0f0f0',
    //justifyContent: 'center',
    //alignItems: 'center',
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  tileText: {
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 10,
    paddingTop: 10,
  },
  tileDescription: {
    fontSize: 16,
    color: '#555',
    paddingLeft: 10,
    paddingRight: 10,
    //textAlign: 'center',
  },
});

export default Keywords;
