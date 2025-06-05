import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  children: any;
  testID?: string;
};

export function Container({ children, testID }: Props) {
  return (
    <View style={styles.center} testID={testID}>
      {children}
    </View>
  );
}

export const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
