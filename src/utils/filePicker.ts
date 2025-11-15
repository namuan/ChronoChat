import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

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
    return null;
  }
}

export async function readFileAsBase64(uri: string): Promise<string> {
  // Use expo-file-system
  const { readAsStringAsync } = await import('expo-file-system');
  const base64 = await readAsStringAsync(uri, { encoding: 'base64' });
  return base64;
}