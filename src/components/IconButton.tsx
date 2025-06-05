import React from 'react';
import { View, Platform, Text, Pressable } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SvgIcons } from '../icons';

function IconButton({
  icon = SvgIcons['menu_icon'],
  style = {},
  title = '',
  color = 'green',
  size = 20,
  onPress = () => { },
}) {
  const containerStyle = [
    { borderWidth: 1, borderColor: '#ccc', padding: 4 },
    style,
  ];
  return (
    <Pressable style={containerStyle} onPress={onPress}>
      {title ? <Text>{title}</Text> : <></>}

      <SvgXml width={size} height={size} fill={color} xml={icon.svg} />
    </Pressable>
  );
}

export { IconButton };
