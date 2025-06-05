import React, { ReactElement, useContext, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { AuthContext } from '../services/AuthContext';
import { Button, Container, TextInput } from '../components';

function Login(): ReactElement {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  return (
    <Container>
      <Text>Username</Text>
      <TextInput
        style={styles.textInput}
        value={username}
        onChangeText={setUsername}
      />
      <Text>Password</Text>
      <TextInput
        style={styles.textInput}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Log in" onPress={() => signIn({ username, password })} />
    </Container>
  );
}
function LogoutButton(): ReactElement {
  const { signOut } = useContext(AuthContext);
  return <Button title="Log Out" onPress={() => signOut()} />;
}

const styles = StyleSheet.create({
  textInput: {
    marginBottom: 16,
    marginTop: 4,
    width: 256,
    height: 40,
    paddingLeft: 8,
  },
});

export { Login, LogoutButton, styles };
