import React from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  Platform,
  KeyboardAvoidingView,
  TextInput,
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
    <SafeAreaView style={{ flex: 1, padding: 10 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 90 : 0}>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={i} style={styles.item}>
              {
                i == 5 ? 
                <>
                  <Text style={styles.h5}>Nested Scrolls</Text>
                  <ScrollView
                  style={{borderWidth: 2, borderColor: 'green' ,maxHeight: 200}}
                  contentContainerStyle={styles.scrollContent}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 20 }).map((_, i1) => (
                      <View key={i1} style={styles.item}>
                        {
                          <Text>Scrollable Item {i1 + 1}</Text>
                        }                      
                      </View>
                    ))}
                    <TextInput style={styles.border}/>
                  </ScrollView>
                </> :
                <Text>Scrollable Item {i + 1}</Text>
              }
              
            </View>
          ))}
          <TextInput style={styles.border}/>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SampleScreen;
