import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { SvgIcons } from '../icons';

function IconSvg({
  icon = SvgIcons['menu_icon'],
  style = {},
  color = 'green',
  size = 20,
}) {
  return (
    <View style={style}>
      <SvgXml width={size} height={size} fill={color} xml={icon.svg} />
    </View>
  );
}

export { IconSvg };
