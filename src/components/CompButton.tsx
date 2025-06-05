import React from 'react';
import { Button, ButtonProps, View, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';

type ExtendedButtonProps = ButtonProps & {
  style?: StyleProp<ViewStyle>;
};

const CompButton = ({ style, ...rest }: ExtendedButtonProps) => {
  const { colors } = useTheme();
  const containerStyle = [{ marginTop: 8 }, style];
  return (
    <View style={containerStyle}>
      <Button color={colors.primary} {...rest} />
    </View>
  );
};

export { CompButton };
