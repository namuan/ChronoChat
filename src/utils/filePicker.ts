import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

export async function pickFile(): Promise<PickedFile | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });
    if (result.canceled === false) {
      const asset = result.assets[0];
      
      // Validate file size (limit to 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (asset.size && asset.size > MAX_FILE_SIZE) {
        throw new Error(`File size (${(asset.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (10MB)`);
      }
      
      return {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
        size: asset.size ?? undefined,
      };
    }
    return null;
  } catch (err) {
    console.error('File pick error:', err);
    throw err; // Re-throw to allow caller to handle
  }
}

export async function readFileAsBase64(uri: string): Promise<string> {
  try {
    // Check if file exists before reading
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist or is not accessible');
    }
    
    // For iOS simulator compatibility, ensure we're using a valid file URI
    let fileUri = uri;
    if (Platform.OS === 'ios' && uri.startsWith('file:///')) {
      // iOS simulator sometimes has issues with certain file paths
      // Try to use the cached version if available
      if (fileInfo.uri) {
        fileUri = fileInfo.uri;
      }
    }
    
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
      return base64;
    } catch (readError) {
      // If direct read fails, try copying to a temporary location first
      console.warn('Direct file read failed, attempting copy to temp location:', readError);
      
      const tempFileUri = FileSystem.cacheDirectory + 'temp_attachment_' + Date.now();
      await FileSystem.copyAsync({ from: fileUri, to: tempFileUri });
      const base64 = await FileSystem.readAsStringAsync(tempFileUri, { encoding: 'base64' });
      
      // Clean up temp file
      try {
        await FileSystem.deleteAsync(tempFileUri);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file:', cleanupError);
      }
      
      return base64;
    }
  } catch (error) {
    console.error('Error reading file as base64:', error);
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}