import React from 'react';
import {
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  ViewStyle,
} from 'react-native';
import { styles } from './ComponentStyles';

type Props = {
  children: any[];
  style?: ViewStyle;
};

export default function PageContainer({ children, style }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }></KeyboardAvoidingView>
      {children}
    </SafeAreaView>
  );
}
