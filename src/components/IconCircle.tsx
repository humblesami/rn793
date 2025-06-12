import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SvgIcons } from '../icons';
import { styles } from './ComponentStyles';

type IconButtonProps = {
  style?: StyleProp<ViewStyle>;
  icon: Record<string, string>;
  color: string;
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  size: number;
};

function IconCircle({
  style,
  icon = SvgIcons['menu_icon'],
  title = '',
  color = 'green', size = 20,
  onPress = () => { },
}: IconButtonProps) {
  return (
    <Pressable style={[styles.flex, style]} onPress={onPress}>
      <View style={[styles.border, {padding: 5}]}>
        <SvgXml width={size} height={size} fill={color} xml={icon.svg} /> 
      </View>
      {title ? <Text style={{marginTop: 5, marginLeft: 5}}>{title}</Text> : <></>}               
    </Pressable>
  );
}

export { IconCircle };
