import { View, StyleSheet, ActivityIndicator, Button, Text, ScrollView } from 'react-native';

const PopupOverlay = ({
  children, x = 0, y = 0,
  width = '100%', height = '90%',
  message = '', onHide = () => { },
}) => {

  if (!message) return <></>;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <View
        style={[
          styles.popup, {
            position: 'absolute', top: y, left: x,
            width: width, height: height,
          },
        ]}
      >
        {children ? 
        <ScrollView style={{maxHeight: '90%'}}> {children} </ScrollView>: 
        <ActivityIndicator size="large" color="orange" style={{ marginBottom: 30 }} />}
        {message ? <Text>{message || 'Loading data'}...</Text> : <></>}
        <Button title="Hide Me"
          onPress={() => {
            onHide();
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  popup: {
    backgroundColor: 'rgba(109, 98, 98, 0.5)', borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, zIndex: 1000,
  },
});

export default PopupOverlay;
