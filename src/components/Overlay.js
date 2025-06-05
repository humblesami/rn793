import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Button, Text } from 'react-native';

const PopupOverlay = ({
  visible = false,
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  message = '',
  children = null,
  onHide = () => { },
}) => {
  const [position, setPosition] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (visible) {
      setHidden(false); // reset internal hidden state when parent says show
    }
    setPosition({
      x, y,
      width: width || '100%',
      height: height || '100%',
    });
  }, [visible, x, y, width, height]);

  if (!visible || hidden || !position) return null;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.popup,
          {
            position: 'absolute',
            top: position.y,
            left: position.x,
            width: position.width,
            height: position.height,
          },
        ]}
      >
        <ActivityIndicator size="large" color="orange" style={{ marginBottom: 30 }} />
        {children}
        {message ? <Text>{message}...</Text> : <></>}
        <Button title="Hide Me"
          onPress={() => {
            setHidden(true);
            onHide();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  popup: {
    backgroundColor: 'rgba(109, 98, 98, 0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 1000,
  },
});

export default PopupOverlay;
