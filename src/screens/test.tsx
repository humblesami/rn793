import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import PaginationView from '../components/PaginationView';
import { styles } from '../components/ComponentStyles';

const SampleScreen = () => {
  const obj_it = {
    page_data: {
      offset: 0,
      per_page: 10,
      record_count: 23,
    },
  };
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Fixed Top Area */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Fixed Top Area</Text>
          <PaginationView
            given_limit={obj_it.page_data.per_page}
            offset={obj_it.page_data.offset}
            total_records={obj_it.page_data.record_count}
            onStartIndexChanged={async (off_set: number) => {
              obj_it.page_data.offset = off_set;
              //obj_it.fetchMyData();
            }}
            onLimitChanged={async (
              off_set: number,
              records_on_page: number,
            ) => {
              obj_it.page_data.per_page = records_on_page;
              obj_it.page_data.offset = off_set;
              //obj_it.fetchMyData();
            }}
          />
        </View>

        {/* Scrollable Area */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={i} style={styles.item}>
              <Text>Scrollable Item {i + 1}</Text>
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SampleScreen;
