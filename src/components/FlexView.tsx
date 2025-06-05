import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
  children: any[];
  style?: ViewStyle;
};

export default function FlexView({ children, style }: Props) {
  return <View style={[styles.defaultStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  defaultStyle: {
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
