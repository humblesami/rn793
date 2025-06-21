import React from 'react';
import { Image, StyleProp, View, ViewStyle } from 'react-native';
import { SvgIcons } from '../icons';

type IconButtonProps = {
  style?: StyleProp<ViewStyle>;
  icon?: string;
  color?: string;
  size?: number;
};

function ImageSvg({
  icon = '',
  style,
  color = 'green',
  size = 20,
}: IconButtonProps) {
  const base64Svg = `data:image/svg+xml;base64,${btoa(icon)}`;
  if(!icon) {
    
  }
  return (
    <View style={[{padding: 2}, style]}>
      <Image source={{ uri: base64Svg }} style={{ height: size }} />
    </View>
  );
}

export { ImageSvg };
