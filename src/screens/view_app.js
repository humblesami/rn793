// App.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Import the reusable component
import ImagePickerUploader from '../components/ImagePicker';

const SampleApp = () => {
  // State to hold ALL uploaded image URIs from all instances of ImagePickerUploader
  const [allUploadedImages, setAllUploadedImages] = useState([]);
  // State for a global image viewer (optional, but kept for demonstration if you want one central viewer)

  /**
   * Callback function to receive newly uploaded URIs from any ImagePickerUploader instance.
   * This adds the new URIs to the main app's consolidated list.
   * @param {string[]} newUris - An array of URIs that were just uploaded.
   */
  const handleNewUploadsComplete = (newUris) => {
    if (newUris && newUris.length > 0) {
      setAllUploadedImages(prevImages => [...prevImages, ...newUris]);
      console.log('App.js received new uploaded URIs:', newUris);
    } else {
      console.log('App.js received null or empty array for new uploads.');
    }
  };


  return (
    <View>
      <Text style={{fontSize: 20, textAlign: 'center'}}>Image Uploader Master App</Text>
      {/* --- Section 2: Multiple Images Uploader --- */}
			<ScrollView contentContainerStyle={styles.container} nestedScrollEnabled={true}>
				<ImagePickerUploader
					label="Multiple Album Photos"
					uploadFolder='Sing'
					multiple={true} // Enable multiple selection
					onUploadComplete={handleNewUploadsComplete}
				/>
			</ScrollView>
      

      {/* Global Image Viewer Modal (optional, if you want a single viewer for all images) */}
      

      <Text style={styles.footerText}>
        Reusable Image Uploader Components Demo.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', // Main app background
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#263238',
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 18,
    color: '#607d8b',
    marginBottom: 40,
    textAlign: 'center',
  },
  globalUploadedImagesSection: {
    marginTop: 40,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  globalListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#37474f',
    textAlign: 'center',
  },
  globalListContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  globalUploadedImageItem: {
    margin: 8, // Space between items
    alignItems: 'center',
    position: 'relative',
  },
  globalThumbnailTouchable: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  globalThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 10,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#cfd8dc',
  },
  globalRemoveButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#c0392b',
  },
  globalRemoveButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footerText: {
    marginTop: 40,
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
});

export default SampleApp;