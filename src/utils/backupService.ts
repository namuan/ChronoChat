import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Note } from '../context/NoteContext';
import { Platform } from 'react-native';

export interface BackupNote extends Omit<Note, 'images'> {
    images?: { uri: string; base64: string }[];
}

export interface BackupData {
    version: number;
    timestamp: number;
    notes: BackupNote[];
}

const BACKUP_VERSION = 2;

export const createBackup = async (notes: Note[]): Promise<void> => {
    try {
        // Process notes to embed images
        const processedNotes: BackupNote[] = await Promise.all(
            notes.map(async (note) => {
                let embeddedImages: { uri: string; base64: string }[] = [];

                if (note.images && note.images.length > 0) {
                    embeddedImages = await Promise.all(
                        note.images.map(async (uri) => {
                            try {
                                const base64 = await FileSystem.readAsStringAsync(uri, {
                                    encoding: 'base64',
                                });
                                return { uri, base64 };
                            } catch (e) {
                                console.warn(`Failed to read image for backup: ${uri}`, e);
                                // Return just the URI if read fails, though it won't be useful on another device
                                // We'll filter these out or handle them gracefully
                                return { uri, base64: '' };
                            }
                        })
                    );
                    // Filter out failed reads if necessary, or keep them to preserve the record
                    embeddedImages = embeddedImages.filter(img => img.base64 !== '');
                }

                return {
                    ...note,
                    images: embeddedImages,
                };
            })
        );

        const backupData: BackupData = {
            version: BACKUP_VERSION,
            timestamp: Date.now(),
            notes: processedNotes,
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const fileName = `chronochat_backup_${new Date().toISOString().split('T')[0]}.json`;
        const fileUri = (FileSystem.documentDirectory || FileSystem.cacheDirectory) + fileName;

        await FileSystem.writeAsStringAsync(fileUri, jsonString, {
            encoding: 'utf8',
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
                UTI: 'public.json',
                mimeType: 'application/json',
                dialogTitle: 'Save Backup',
            });
        } else {
            throw new Error('Sharing is not available on this device');
        }
    } catch (error) {
        console.error('Backup failed:', error);
        throw error;
    }
};

export const restoreBackup = async (): Promise<Note[]> => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/json',
            copyToCacheDirectory: true,
        });

        if (result.canceled) {
            throw new Error('Restore cancelled');
        }

        const fileUri = result.assets[0].uri;
        const content = await FileSystem.readAsStringAsync(fileUri, {
            encoding: 'utf8',
        });

        const data = JSON.parse(content);

        // Basic validation
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid backup file format');
        }

        let backupNotes: any[] = [];
        if (Array.isArray(data.notes)) {
            backupNotes = data.notes;
        } else if (Array.isArray(data)) {
            // Legacy array format
            backupNotes = data;
        } else {
            throw new Error('Invalid backup data: missing notes array');
        }

        // Ensure images directory exists
        const imagesDir = (FileSystem.documentDirectory || FileSystem.cacheDirectory) + 'imported_images/';
        const dirInfo = await FileSystem.getInfoAsync(imagesDir);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
        }

        // Process notes to restore images
        const restoredNotes: Note[] = await Promise.all(
            backupNotes.map(async (note: any) => {
                let restoredImages: string[] = [];

                // Handle embedded images (Version 2+)
                if (note.images && Array.isArray(note.images) && note.images.length > 0 && typeof note.images[0] === 'object') {
                    restoredImages = await Promise.all(
                        note.images.map(async (img: { uri: string; base64: string }) => {
                            if (!img.base64) return img.uri; // Fallback if no data

                            // Create a unique filename
                            const filename = `restored_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
                            const newPath = imagesDir + filename;

                            try {
                                await FileSystem.writeAsStringAsync(newPath, img.base64, {
                                    encoding: 'base64',
                                });
                                return newPath;
                            } catch (e) {
                                console.warn('Failed to write restored image:', e);
                                return img.uri; // Keep original URI (likely broken but better than nothing)
                            }
                        })
                    );
                }
                // Handle legacy images (Version 1 - just URIs)
                else if (note.images && Array.isArray(note.images)) {
                    restoredImages = note.images;
                }

                return {
                    ...note,
                    timestamp: new Date(note.timestamp),
                    images: restoredImages,
                };
            })
        );

        return restoredNotes;
    } catch (error) {
        console.error('Restore failed:', error);
        throw error;
    }
};
