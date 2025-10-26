import React, { useRef, useEffect, useMemo } from 'react';
import { View, Animated, StyleSheet, Text, useColorScheme } from 'react-native';
import { getTheme } from "../constants/ColorConstants";

const Loader = ({ message = '' }) => {

  const scheme = useColorScheme();
  const theme = useMemo(() => getTheme(scheme), [scheme]);
  
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
        <Animated.View style={[styles.dot, { transform: [{ translateY: bounce1 }], backgroundColor: theme.loaderBg}]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: bounce2 }], backgroundColor: theme.loaderBg }]} />
        <Animated.View style={[styles.dot, { transform: [{ translateY: bounce3 }], backgroundColor: theme.loaderBg }]} />
      </View>
      {message !== '' && (
        <Text style={[styles.message, {color: theme.loaderText}]}>{message}</Text>
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
    marginHorizontal: 6,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default Loader;
