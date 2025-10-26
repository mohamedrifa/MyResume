import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';

const Loader = ({ message = '' }) => {
  
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const bounce3 = useRef(new Animated.Value(0)).current;

  const animateDot = (dot, delay) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: -10,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    animateDot(bounce1, 0);
    animateDot(bounce2, 150);
    animateDot(bounce3, 300);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { transform: [{ translateY: bounce1 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: bounce2 }] }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: bounce3 }] }]} />
      </View>
      {message !== '' && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6c89c7ff',
    marginHorizontal: 6,
  },
  message: {
    fontSize: 16,
    color: '#ffffffff',
    fontWeight: '500',
  },
});

export default Loader;
