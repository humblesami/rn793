import React from 'react';

import { View, StyleSheet } from 'react-native';

function Overlay({ ...props }) {
  if (props.hidden) return null;

  return (
    <View style={styles.overlay} activeOpacity={1} {...props}>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    top: 100,
    position: 'absolute',
    flex: 1,
    zIndex: 6788,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 1)', // Adjust the opacity here
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Overlay;
