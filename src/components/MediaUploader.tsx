/**
 * File Upload Component for Exercise Media
 * 
 * Handles image and video uploads for exercise content with:
 * - Progress indicators
 * - Mobile-optimized UI for seniors
 * - Error handling and validation
 * - Thumbnail generation for videos
 * - Integration with Supabase Storage
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video, ResizeMode } from 'expo-av';

import { uploadExerciseThumbnail, uploadExerciseVideo, getFilePublicUrl } from '../services/content-library';

const { width } = Dimensions.get('window');

// Colors optimized for seniors
const colors = {
  primary: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    600: '#4b5563',
    900: '#111827',
  },
  white: '#ffffff',
} as const;

// Typography optimized for seniors
const typography = {
  body: {
    fontSize: 18,
    lineHeight: 26,
  },
  caption: {
    fontSize: 16,
    lineHeight: 22,
  },
} as const;

export interface FileUploadProps {
  type: 'image' | 'video';
  onUploadComplete: (fileUrl: string, thumbnailUrl?: string) => void;
  onUploadError?: (error: string) => void;
  currentFileUrl?: string;
  style?: ViewStyle;
}

export interface UploadProgress {
  uploading: boolean;
  progress: number;
  status: string;
}

const MediaUploader: React.FC<FileUploadProps> = ({
  type,
  onUploadComplete,
  onUploadError,
  currentFileUrl,
  style,
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    uploading: false,
    progress: 0,
    status: '',
  });
  
  const [previewUri, setPreviewUri] = useState<string | null>(currentFileUrl || null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to upload exercise media.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  };

  const generateVideoThumbnail = async (videoUri: string): Promise<string | null> => {
    try {
      setUploadProgress(prev => ({ ...prev, status: 'Generating thumbnail...' }));
      
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: 1000, // 1 second into video
        quality: 0.8,
      });
      
      return uri;
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      return null;
    }
  };

  const uploadFile = async (uri: string, fileType: 'image' | 'video') => {
    try {
      setUploadProgress({
        uploading: true,
        progress: 0,
        status: 'Preparing upload...',
      });

      // Create File object from URI
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Determine file extension
      const uriParts = uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];
      
      // Create a File object with proper name
      const fileName = `exercise_${Date.now()}.${fileExtension}`;
      const file = new File([blob], fileName, {
        type: fileType === 'image' ? `image/${fileExtension}` : `video/${fileExtension}`,
      });

      setUploadProgress(prev => ({ ...prev, progress: 25, status: 'Uploading file...' }));

      let uploadedFilePath: string;
      
      if (fileType === 'image') {
        uploadedFilePath = await uploadExerciseThumbnail(file);
      } else {
        uploadedFilePath = await uploadExerciseVideo(file);
      }

      setUploadProgress(prev => ({ ...prev, progress: 75, status: 'Processing...' }));

      // Generate thumbnail for video if needed
      let thumbnailPath: string | undefined;
      if (fileType === 'video') {
        const thumbnailUri = await generateVideoThumbnail(uri);
        if (thumbnailUri) {
          const thumbResponse = await fetch(thumbnailUri);
          const thumbBlob = await thumbResponse.blob();
          const thumbFile = new File([thumbBlob], `thumb_${fileName}.jpg`, {
            type: 'image/jpeg',
          });
          
          thumbnailPath = await uploadExerciseThumbnail(thumbFile);
        }
      }

      setUploadProgress(prev => ({ ...prev, progress: 100, status: 'Upload complete!' }));

      // Get public URLs
      const bucketName = fileType === 'image' ? 'exercise-thumbnails' : 'exercise-videos';
      const publicUrl = getFilePublicUrl(bucketName, uploadedFilePath);
      
      let thumbnailUrl: string | undefined;
      if (thumbnailPath) {
        thumbnailUrl = getFilePublicUrl('exercise-thumbnails', thumbnailPath);
      }

      setTimeout(() => {
        setUploadProgress({ uploading: false, progress: 0, status: '' });
        setPreviewUri(publicUrl);
        onUploadComplete(publicUrl, thumbnailUrl);
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress({ uploading: false, progress: 0, status: '' });
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onUploadError?.(errorMessage);
      
      Alert.alert(
        'Upload Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const handlePickMedia = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: type === 'image' 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        aspect: type === 'image' ? [16, 9] : undefined,
      };

      if (type === 'video') {
        options.videoMaxDuration = 60; // 1 minute max for exercise demos
      }

      const result = await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate file size
        const maxSize = type === 'image' ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
        
        if (asset.fileSize && asset.fileSize > maxSize) {
          Alert.alert(
            'File Too Large',
            `${type === 'image' ? 'Images' : 'Videos'} must be less than ${type === 'image' ? '5' : '50'}MB`,
            [{ text: 'OK' }]
          );
          return;
        }

        await uploadFile(asset.uri, type);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to select media. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: type === 'image' 
          ? ImagePicker.MediaTypeOptions.Images 
          : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        aspect: type === 'image' ? [16, 9] : undefined,
        videoMaxDuration: type === 'video' ? 60 : undefined,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadFile(result.assets[0].uri, type);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showMediaOptions = () => {
    Alert.alert(
      `Add ${type === 'image' ? 'Exercise Photo' : 'Exercise Video'}`,
      `Choose how to add your ${type === 'image' ? 'exercise photo' : 'exercise demonstration video'}`,
      [
        {
          text: type === 'image' ? 'Take Photo' : 'Record Video',
          onPress: handleTakePhoto,
        },
        {
          text: type === 'image' ? 'Choose from Library' : 'Choose from Library', 
          onPress: handlePickMedia,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const removeMedia = () => {
    Alert.alert(
      `Remove ${type === 'image' ? 'Image' : 'Video'}`,
      `Are you sure you want to remove this ${type === 'image' ? 'image' : 'video'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPreviewUri(null);
            onUploadComplete(''); // Empty string indicates removal
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>
        {type === 'image' ? 'Exercise Photo' : 'Exercise Video'} 
        <Text style={styles.optional}> (Optional)</Text>
      </Text>
      
      {uploadProgress.uploading ? (
        <View style={styles.uploadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.uploadStatus}>{uploadProgress.status}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${uploadProgress.progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{uploadProgress.progress}%</Text>
        </View>
      ) : previewUri ? (
        <View style={styles.previewContainer}>
          {type === 'image' ? (
            <Image source={{ uri: previewUri }} style={styles.imagePreview} />
          ) : (
            <Video
              source={{ uri: previewUri }}
              style={styles.videoPreview}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
              useNativeControls
            />
          )}
          
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.changeButton} onPress={showMediaOptions}>
              <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
              <Text style={styles.changeButtonText}>Change</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.removeButton} onPress={removeMedia}>
              <Ionicons name="trash" size={20} color={colors.danger} />
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={showMediaOptions}>
          <Ionicons 
            name={type === 'image' ? 'camera' : 'videocam'} 
            size={32} 
            color={colors.gray[600]} 
          />
          <Text style={styles.uploadButtonText}>
            {type === 'image' ? 'Add Exercise Photo' : 'Add Exercise Video'}
          </Text>
          <Text style={styles.uploadHint}>
            {type === 'image' 
              ? 'Tap to take a photo or choose from your library' 
              : 'Tap to record or choose a demonstration video'
            }
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  } as ViewStyle,
  
  label: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 8,
  } as TextStyle,
  
  optional: {
    fontWeight: '400',
    color: colors.gray[600],
  } as TextStyle,
  
  uploadButton: {
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    minHeight: 140,
  } as ViewStyle,
  
  uploadButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.gray[600],
    marginTop: 8,
    textAlign: 'center',
  } as TextStyle,
  
  uploadHint: {
    ...typography.caption,
    color: colors.gray[600],
    marginTop: 4,
    textAlign: 'center',
  } as TextStyle,
  
  uploadingContainer: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
    minHeight: 140,
  } as ViewStyle,
  
  uploadStatus: {
    ...typography.body,
    color: colors.gray[600],
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  } as TextStyle,
  
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  } as ViewStyle,
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  } as ViewStyle,
  
  progressText: {
    ...typography.caption,
    color: colors.gray[600],
    textAlign: 'center',
  } as TextStyle,
  
  previewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
  } as ViewStyle,
  
  imagePreview: {
    width: '100%',
    height: 200,
  },
  
  videoPreview: {
    width: '100%',
    height: 200,
  } as ViewStyle,
  
  previewActions: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  } as ViewStyle,
  
  changeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.primary,
  } as ViewStyle,
  
  changeButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  } as TextStyle,
  
  removeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.danger,
  } as ViewStyle,
  
  removeButtonText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.danger,
    marginLeft: 6,
  } as TextStyle,
});

export default MediaUploader;