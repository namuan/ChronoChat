import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform, Alert, Linking } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export async function openFilePreview(uri: string, fileName: string, mimeType: string): Promise<void> {
  try {
    // For SDK 54+, we need to handle file preview differently
    // First, ensure the file exists and is accessible
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist or is not accessible');
    }

    if (Platform.OS === 'ios') {
      // On iOS, use Sharing to open the file in a native preview
      // This works reliably across iOS versions
      await Sharing.shareAsync(uri, {
        UTI: mimeType,
        mimeType: mimeType,
      });
    } else {
      // On Android, try multiple approaches
      try {
        // First, try to get a content URI for better app compatibility
        let contentUri: string;
        try {
          contentUri = await FileSystem.getContentUriAsync(uri);
        } catch (contentUriError) {
          console.warn('Failed to get content URI, using original URI:', contentUriError);
          contentUri = uri;
        }

        // Try to open with IntentLauncher
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1,
          type: mimeType,
        });
      } catch (intentError) {
        console.warn('IntentLauncher failed, falling back to sharing:', intentError);
        // If no app can handle the intent, fall back to sharing
        await Sharing.shareAsync(uri, {
          mimeType: mimeType,
        });
      }
    }
  } catch (error) {
    console.error('Error opening file preview:', error);
    
    // Provide user-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('No Activity found')) {
        Alert.alert(
          'No App Available',
          `No app is installed that can open ${fileName}. Please install an app that can handle ${mimeType} files.`,
          [{ text: 'OK' }]
        );
      } else if (error.message.includes('User did not share')) {
        // User cancelled the share dialog - this is not an error
        console.log('User cancelled file preview');
      } else {
        Alert.alert(
          'Unable to Open File',
          `Could not open ${fileName}. Error: ${error.message}`,
          [{ text: 'OK' }]
        );
      }
    } else {
      Alert.alert(
        'Unable to Open File',
        `Could not open ${fileName}. Please try again.`,
        [{ text: 'OK' }]
      );
    }
  }
}

export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type.startsWith('video/')) return '🎞️';
  if (type.startsWith('audio/')) return '🔊';
  if (type.includes('pdf')) return '📄';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('zip') || type.includes('rar')) return '🗜️';
  if (type.includes('text')) return '📝';
  if (type.includes('word')) return '📝';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
  return '📎';
}