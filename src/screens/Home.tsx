import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { ReactElement } from 'react';
import { Button, Container } from '../components';
import { MainStackParams } from '../app';

type NavigationProps = NativeStackNavigationProp<MainStackParams, 'Home'>;

export default function Home(): ReactElement {
  const { navigate } = useNavigation<NavigationProps>();
  return (
    <Container>
      <Button
        title="Go to Settings"
        onPress={() => navigate('Settings')}
        testID="settings"
      />
    </Container>
  );
}
