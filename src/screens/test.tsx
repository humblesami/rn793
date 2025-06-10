import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Button,
} from 'react-native';
import { styles } from '../components/ComponentStyles';
import FlexView from '../components/FlexView';
import PopupOverlay from '../components/Overlay';

const SampleScreen = () => {
  const [data_loading, setDataLoading] = useState('')
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

          <FlexView>
          <Button onPress={()=>{
            setDataLoading('Loading data')
          }} title='Show loader'/>
          <Button onPress={()=>{
            setDataLoading('')
          }} title='Hide loader'/>
        </FlexView>

        {
          data_loading ? <PopupOverlay children={null} 
        onHide={() => { setDataLoading('') }}
        message={data_loading} /> : <></>
        }
         

        <ScrollView
          contentContainerStyle={styles.scrollContent}          
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {Array.from({ length: 30 }).map((_, i) => (
            <View key={i} style={styles.listItem}>
              {
                i == 5 ? 
                <>
                  <Text style={styles.h5}>Nested Scrolls</Text>
                  <ScrollView
                  style={{borderWidth: 2, borderColor: 'green' ,maxHeight: 200}}
                  contentContainerStyle={{}}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 20 }).map((_, i1) => (
                      <View key={i1} style={styles.listItem}>
                        { <Text>Scrollable Item {i1 + 1}</Text> }
                      </View>
                    ))}
                    <TextInput/>
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
