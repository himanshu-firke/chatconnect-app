import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppIcon = ({ size = 60, showText = true, style = {} }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.iconContainer, { width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name="chatbubbles" size={size * 0.5} color="#fff" />
      </View>
      {showText && (
        <Text style={[styles.appName, { fontSize: size * 0.25 }]}>ChatConnect</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default AppIcon;
