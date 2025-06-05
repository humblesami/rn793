import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  ViewStyle,
} from 'react-native';

let operators = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  eq: '=',
  neq: '!=',
  in: 'in',
};

let search_fields = [];
let search_value = '';

export default class FilterView extends React.Component {
  render() {
    return (
      <View>
        <Text>Love</Text>
      </View>
    );
  }
}
