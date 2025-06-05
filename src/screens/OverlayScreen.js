import React, { useState } from 'react';

import { View, Text, TouchableOpacity } from 'react-native';
import Overlay from '../components/Overlay';

function OverlayScreen() {
  const [isOverlayVisible, setOverlayVisible] = useState(true);

  const toggleOverlay = () => {
    setOverlayVisible(!isOverlayVisible);
  };

  const [selectedValue, setSelectedValue] = useState('');
  const data = ['Apple', 'Banana', 'Orange', 'Mango'];

  const handleSelect = item => {
    setSelectedValue(item);
  };

  return (
    <View style={{ flex: 1, justifyContent: '', alignItems: 'center' }}></View>
  );
}

export default OverlayScreen;
