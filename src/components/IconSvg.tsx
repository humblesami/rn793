import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SvgIcons } from '../icons';

type IconButtonProps = {
  style?: StyleProp<ViewStyle>;
  icon?: Record<string, string>;
  color?: string;
  size?: number;
};

function IconSvg({
  icon = SvgIcons['menu_icon'],
  style,
  color = 'green',
  size = 20,
}: IconButtonProps) {
  return (
    <View style={[{padding: 2}, style]}>
      <SvgXml width={size} height={size} fill={color} xml={icon.svg} />
    </View>
  );
}

export { IconSvg };
