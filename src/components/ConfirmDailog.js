import { Alert } from 'react-native';

export default ConfirmDailog = (onPress, message) => {
  return Alert.alert(
    'Are your sure?',
    message || 'Are you sure you want to remove it?',
    [
      // The "Yes" button
      {
        text: 'Yes',
        onPress: () => {
          onPress();
        },
      },
      // The "No" button
      // Does nothing but dismiss the dialog when tapped
      {
        text: 'No',
      },
    ],
  );
};
