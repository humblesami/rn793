import React from 'react';
import { Alert, StyleSheet, View, ViewStyle } from 'react-native';
import { CompButton } from '../components/CompButton';
import { exportDatabaseToDownloads } from '../services/copy_db';
import { ExpenseDb } from '../db/expense/expense_db';

export default function SimpleView() {
  return (
    <View>
      <CompButton
        title="Copy Database"
        onPress={() => {
          exportDatabaseToDownloads('com.mwrn', 'expense.db');
        }}
      />
      <CompButton
        title="Truncate Trans Cats"
        onPress={() => {
          ExpenseDb.truncateTable('trans_cats').then(res => {
            Alert.alert(res || 'Unknown issue');
          });
        }}
      />
      <CompButton
        title="Truncate Transactions"
        onPress={() => {
          ExpenseDb.truncateTable('transactions').then(res => {
            Alert.alert(res || 'Unknown issue');
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  defaultStyle: {
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
