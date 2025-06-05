import { useTheme } from '@react-navigation/native';
import React, { useState } from 'react';
import { Switch as DefaultSwitch, Platform, SwitchProps } from 'react-native';

interface HybridSwitchProps extends SwitchProps {
  activeThumbColor?: string | null | undefined;
}

export const Toggler = (props: HybridSwitchProps) => {
  const { colors } = useTheme();
  const newProps = { ...props };

  if (Platform.OS === 'web') {
    newProps.activeThumbColor = colors.primary;
  }

  return (
    <DefaultSwitch
      trackColor={{ false: colors.text, true: colors.text }}
      thumbColor={props.value ? colors.primary : 'red'}
      ios_backgroundColor={colors.background}
      {...props}
      value={props.value}
    />
  );
};
