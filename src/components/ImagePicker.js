import React, { useState, useCallback, useEffect, cloneElement } from 'react';
import ImageViewer from 'react-native-image-zoom-viewer';
import {
	View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator,
	Alert, FlatList, Platform, PermissionsAndroid,
	Modal,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import RNFS from 'react-native-fs';
import { useFocusEffect } from '@react-navigation/native';

const ImagePickerUploader = ({ uploadFolder }) => {
	const [locallySavedImages, setLocallySavedImages] = useState([]); // Images saved locally (app-specific paths)
	const [isProcessing, setIsProcessing] = useState(false); // For saving/deleting operations
	const [selectedForDeletion, setSelectedForDeletion] = useState([]);
	const [imageViewerIndex, setImageViewerIndex] = useState(-1);

	const getFolderPath = async () => {
		let folderPath = RNFS.DocumentDirectoryPath;
		try {
			folderPath = `${folderPath}/Pictures`;
			let folderExists = await RNFS.exists(folderPath);
			if (!folderExists) {
				await RNFS.mkdir(folderPath);
			}
			let leafFolder = uploadFolder ? `/${uploadFolder.trim()}` : '';
			folderPath = `${folderPath}${leafFolder}`;
			folderExists = await RNFS.exists(folderPath);
			if (!folderExists) {
				await RNFS.mkdir(folderPath);
			}
			return folderPath;
		} catch (err) {
			Alert.alert("Could not create " + folderPath);
		}

	};

	// --- Request Storage Permissions (Android) ---
	const requestStoragePermission = async () => {
		if (Platform.OS === 'android') {
			try {
				const granted = await PermissionsAndroid.requestMultiple([
					PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
					PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
				]);
				if (
					granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
					granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
				) {
					console.log('Storage permissions granted');
					return true;
				} else {
					console.log('Storage permissions denied');
					Alert.alert('Permission Denied', 'Storage permissions are required to save and manage images.');
					return false;
				}
			} catch (err) {
				console.warn(err);
				return false;
			}
		}
		return true; // iOS doesn't typically need explicit FS permissions for app's sandbox
	};

	useFocusEffect(
		useCallback(() => {
			fetchLocalImages();
		}, [fetchLocalImages])
	);


	// --- Fetch Locally Saved Images ---
	const fetchLocalImages = async () => {
		const currentFolderPath = await getFolderPath();
		if (!currentFolderPath) {
			setIsProcessing(false);
			setLocallySavedImages([]);
			return;
		}

		setIsProcessing(true);
		try {
			const files = await RNFS.readDir(currentFolderPath);
			const imageFiles = files
				.filter(file => file.isFile() && /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
				.map(file => ({
					uri: `file://${file.path}`, // RNFS returns absolute path, prepend 'file://' for Image component
					id: file.path, // Use full path as a unique ID for local files
					name: file.name,
					selected: false,
				}));
			setLocallySavedImages(imageFiles);
		} catch (error) {
			console.error('Error fetching locally saved images:', error);
			Alert.alert('Error', 'Failed to read images from local storage.' + error);
			setLocallySavedImages([]); // Clear in case of error
		} finally {
			setIsProcessing(false);
		}
	};

	// --- Image Picking (Single/Multiple) ---
	const pickImages = async (multiple = false) => {
		try {
			const options = {
				multiple: multiple,
				cropping: true,
				mediaType: 'photo',
				forceJpg: true,
				cropperToolbarTitle: 'Crop Image',
			};

			let images;
			if (multiple) {
				images = await ImagePicker.openPicker(options);
			} else {
				const image = await ImagePicker.openPicker(options);
				images = [image];
			}
			setIsProcessing(true)

			const validImages = images.filter(img => img && img.path).map(img => ({
				uri: img.path, // This is a temporary path provided by the picker
				type: img.mime,
				name: img.path.split('/').pop(),
			}));

			saveSelectedImages(validImages);
		} catch (error) {
			if (error.code === 'E_PICKER_CANCELLED') {
				console.log('User cancelled image picker');
			} else {
				console.error('Image picker error: ', error);
				Alert.alert('Error', 'Failed to pick images.');
			}
		}
	};

	// --- Save Selected Images Locally ---
	const saveSelectedImages = async (validImages) => {
		if (validImages.length === 0) {
			Alert.alert('No Images', 'Please select images to save first.');
			return;
		}
		const currentFolderPath = await getFolderPath();
		if (!currentFolderPath) {
			setIsProcessing(false);
			Alert.alert('Missing Folder Name', 'Please provide a folder name.');
			return;
		}

		setIsProcessing(true);
		try {
			for (const image of validImages) {
				const fileName = `${Date.now()}_${image.name}`; // Ensure unique file name
				const newPath = `${currentFolderPath}/${fileName}`;
				await RNFS.copyFile(image.uri, newPath);
			}
			await fetchLocalImages();
		} catch (error) {
			console.error('Error saving images locally:', error);
			Alert.alert('Error', 'Failed to save images locally. Check permissions and device storage.');
		} finally {
			setIsProcessing(false);
		}
	};

	// --- Manage Selected for Deletion ---
	const selectItemForDeletion = (imageId) => {
		setSelectedForDeletion(prev =>
			prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
		);
	};

	const closeImageViewer = () => {
		setImageViewerIndex(-1);
	};

	const openImageViewer = (index) => {
		if (selectedForDeletion.length) {
			const imageItem = locallySavedImages[index];
			if (imageItem.selected) {
				const others = selectedForDeletion.filter(item => item.id != imageItem.id);
				setSelectedForDeletion(others)
			}
			else {
				selectItemForDeletion(imageItem.id);
			}
		} else {
			if (locallySavedImages.length > 0) {
				setImageViewerIndex(index);
			} else {
				Alert.alert('No Images', 'No images have been uploaded yet to view globally.');
			}
		}
	};

	// --- Delete Selected Locally Saved Images ---
	const deleteSelectedLocalImages = async () => {
		if (selectedForDeletion.length === 0) {
			Alert.alert('No Images Selected', 'Please select images to delete from the saved list.');
			return;
		}

		Alert.alert('Confirm Deletion',
			`Are you sure you want to delete ${selectedForDeletion.length} image(s)?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					onPress: async () => {
						setIsProcessing(true);
						try {
							for (const imagePath of selectedForDeletion) {
								const fileExists = await RNFS.exists(imagePath);
								if (fileExists) {
									await RNFS.unlink(imagePath);
								}
							}
							Alert.alert('Success', 'Selected images deleted successfully!');
							setSelectedForDeletion([]); // Clear selection
							fetchLocalImages(); // Refresh the list
						} catch (error) {
							console.error('Deletion error:', error);
							Alert.alert('Error', 'Failed to delete images.');
						} finally {
							setIsProcessing(false);
						}
					},
				},
			]
		);
	};

	function renderViewer(imgIndex) {
		if(imgIndex == -1){
			return (<></>);
		}
		const urls = locallySavedImages.map(item => ({ url: item.uri }));
		if(!urls.length) {
			return (<></>)
		} if(imgIndex == undefined){
			Alert.alert("Invalid image index");
			return;
		}
		console.log(89004222, urls[imgIndex], imgIndex, "modal");
		return (
			<Modal
				visible={true}
				transparent={true}
				onRequestClose={closeImageViewer}
			>
				<ImageViewer
					imageUrls={urls}				
					enableSwipeDown={true}
					onSwipeDown={closeImageViewer}
					onClick={closeImageViewer}
					backgroundColor="rgba(0,0,0,0.9)"
					index={imgIndex}
					onChange={(index) => setImageViewerIndex(index)}
				/>
			</Modal>
		)
	}

	// --- Render Items for Locally Saved Images List ---
	const renderLocallySavedImageItem = ({ item, index }) => {
		if (item.empty) {
			return (<View style={{ backgroundColor: 'transparent' }}></View>);
		}
		const isSelected = selectedForDeletion.includes(item.id);
		return (
			<TouchableOpacity
				style={[styles.savedImageWrapper, isSelected && styles.selectedForDeletion]}
				onLongPress={() => selectItemForDeletion(item.id)}
				onPress={() => openImageViewer(index)}
			>
				<Image source={{ uri: item.uri }} style={styles.savedImage} />
				{isSelected && (
					<View style={styles.selectionOverlay}>
						<Text style={styles.selectionText}>✓</Text>
					</View>
				)}
			</TouchableOpacity>
		);
	};

	const usePaddedData = (data, columns) => {
		const padded = [...data];
		let rem = data.length % columns;
		if (rem != 0) {
			while (rem != columns) {
				padded.push({ key: `blank-${rem}`, empty: true });
				rem += 1;
			}
		}
		return padded;
	};

	return (
		<View>
			<Text style={styles.header}>Local Image Manager</Text>
			{/* Image Selection */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>2. Select Images to Save (with Crop)</Text>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.button} onPress={() => pickImages(false)} disabled={isProcessing}>
						<Text style={styles.buttonText}>Pick Single Image</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.button} onPress={() => pickImages(true)} disabled={isProcessing}>
						<Text style={styles.buttonText}>Pick Multiple Images</Text>
					</TouchableOpacity>
				</View>
			</View>

			{/* Locally Saved Images List */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>3. Locally Saved Images in "{uploadFolder || 'N/A'}"</Text>
				{locallySavedImages.length > 0 ? (
					<View style={styles.previewContainer}>
						<FlatList
							data={usePaddedData(locallySavedImages, 3)}
							numColumns={3}
							keyExtractor={(item) => item.id}
							scrollEnabled={false}
							renderItem={renderLocallySavedImageItem}
							contentContainerStyle={styles.savedImagesGrid}
						/>
						{selectedForDeletion.length > 0 && (
							<TouchableOpacity
								style={[styles.button, styles.deleteButton]}
								onPress={deleteSelectedLocalImages}
								disabled={isProcessing}
							>
								{isProcessing ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.buttonText}>Delete Selected ({selectedForDeletion.length})</Text>
								)}
							</TouchableOpacity>
						)}
					</View>
				) : (
					<Text style={styles.noImagesText}>No images saved to this local folder yet.</Text>
				)}
				<Text style={styles.noImagesText}>{Date()}</Text>
			</View>
			{ renderViewer(imageViewerIndex) }
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f0f0f0',
	},
	cloneViewerBtn: {
		position: 'absolute',
    top: 40, // Adjust for safe area
    right: 20,
    zIndex: 1, // Ensure button is on top
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
	},
	contentContainer: {
		padding: 5,
		paddingBottom: 50,
	},
	header: {
		fontSize: 18,
		fontWeight: 'bold',
		textAlign: 'center',
		color: '#333',
	},
	section: {
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 15,
		marginBottom: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15,
		color: '#555',
	},
	input: {
		height: 45,
		borderColor: '#ddd',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 15,
		marginBottom: 15,
		fontSize: 16,
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 10,
	},
	button: {
		backgroundColor: '#007bff',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1,
		marginHorizontal: 5,
	},
	buttonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	saveButton: {
		backgroundColor: '#28a745',
		marginTop: 15,
		width: '100%',
		marginHorizontal: 0,
	},
	deleteButton: {
		backgroundColor: '#dc3545',
		marginTop: 15,
		width: '100%',
		marginHorizontal: 0,
	},
	previewContainer: {
		marginTop: 15,
		borderTopWidth: 1,
		borderTopColor: '#eee',
		paddingTop: 15,
	},
	previewTitle: {
		fontSize: 16,
		fontWeight: '600',
		marginBottom: 10,
		color: '#666',
	},
	savedImage: {
		// width: 240,
		// height: 240,
		// borderRadius: 8,
		// marginRight: 10,
		// borderWidth: 1,
		// borderColor: '#ddd',
		// resizeMode: 'cover',

		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	thumbnail: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	savedImagesGrid: {
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
	},
	savedImageWrapper: {
		width: '30%',
		aspectRatio: 1,
		margin: '1.6%',
		borderRadius: 8,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#eee',
		position: 'relative',
	},

	selectedForDeletion: {
		borderColor: '#007bff',
		borderWidth: 3,
	},
	selectionOverlay: {
		position: 'absolute',
		top: 5,
		right: 5,
		backgroundColor: 'rgba(0, 123, 255, 0.8)',
		borderRadius: 15,
		width: 25,
		height: 25,
		alignItems: 'center',
		justifyContent: 'center',
	},
	selectionText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	noImagesText: {
		textAlign: 'center',
		color: '#888',
		marginTop: 10,
		fontSize: 16,
	},
});

export default ImagePickerUploader;