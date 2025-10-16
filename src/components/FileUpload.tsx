/**
 * File Upload Component for Exercise Media
 * Placeholder version - install media packages to enable full functionality
 * 
 * To enable full functionality, run:
 * npx expo install expo-image-picker expo-av expo-video-thumbnails
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FileUploadProps {
  type: 'image' | 'video';
  onUploadComplete: (url: string) => void;
  existingUrl?: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  type,
  onUploadComplete,
  existingUrl,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleUploadPress = () => {
    if (disabled || uploading) return;

    Alert.alert(
      'Media Upload',
      'Install expo-image-picker, expo-av, and expo-video-thumbnails packages to enable file uploads.',
      [
        {
          text: 'Simulate Upload',
          onPress: () => simulateUpload(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
    );
  };

  const simulateUpload = () => {
    setUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      const mockUrl = `https://example.com/${type}/${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`;
      onUploadComplete(mockUrl);
      Alert.alert('Success', `${type} uploaded successfully!`);
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {type === 'image' ? 'Exercise Thumbnail' : 'Exercise Video'}
        {type === 'video' && <Text style={styles.optional}> (Optional)</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.uploadButton, disabled && styles.disabled]}
        onPress={handleUploadPress}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.uploadingText}>
              Uploading {type}...
            </Text>
          </View>
        ) : (
          <>
            <Ionicons 
              name={type === 'image' ? 'camera-outline' : 'videocam-outline'} 
              size={48} 
              color="#666" 
            />
            <Text style={styles.uploadText}>
              Tap to add {type === 'image' ? 'thumbnail' : 'video'}
            </Text>
            <Text style={styles.uploadSubtext}>
              {type === 'image' 
                ? 'JPG, PNG up to 5MB'
                : 'MP4, MOV up to 50MB (max 2 min)'
              }
            </Text>
            <Text style={styles.installNote}>
              Install media packages to enable uploads
            </Text>
          </>
        )}
      </TouchableOpacity>

      {existingUrl && (
        <View style={styles.existingFile}>
          <Ionicons 
            name={type === 'image' ? 'image-outline' : 'videocam-outline'} 
            size={24} 
            color="#007AFF" 
          />
          <Text style={styles.existingFileText}>
            Current {type}: {existingUrl.split('/').pop()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optional: {
    fontWeight: '400',
    color: '#666',
  },
  uploadButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
  },
  disabled: {
    opacity: 0.5,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  uploadingText: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 12,
    fontWeight: '500',
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: '#E9ECEF',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  previewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoPreviewContainer: {
    width: '100%',
    height: 200,
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  replaceButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  replaceText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 4,
  },
  installNote: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  existingFile: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  existingFileText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
});

export default FileUpload;