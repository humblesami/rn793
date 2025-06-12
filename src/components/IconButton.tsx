import React from 'react';
import { Text, Pressable, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SvgIcons } from '../icons';
import { styles } from './ComponentStyles';

type IconButtonProps = {
  style?: StyleProp<ViewStyle>;
  icon?: Record<string, string>;
  color?: string;
  title?: string;
  onPress?: (event: GestureResponderEvent) => void;
  size?: number;
};

function IconButton({
  style,
  icon = SvgIcons['menu_icon'],
  title = '',
  color = 'green', size = 20,
  onPress = () => { },
}: IconButtonProps) {
  return (
    <Pressable style={[{padding: 3, paddingLeft: 10}, styles.border, style]} onPress={onPress}>
      {title ? <Text>{title}</Text> : <></>}
      <SvgXml width={size} height={size} fill={color} xml={icon.svg} />
    </Pressable>
  );
}

export { IconButton };
