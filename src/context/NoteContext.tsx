import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface FileAttachment {
  uri: string;
  name: string;
  type: string;
  data: string; // base64
}

export interface Note {
  id: string;
  content: string;
  timestamp: Date;
  tags: string[];
  images?: string[];
  files?: FileAttachment[];
}

interface NoteContextType {
  notes: Note[];
  addNote: (content: string, tags?: string[], images?: string[], files?: FileAttachment[]) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotesByTag: (tag: string) => Note[];
  showTags: boolean;
  setShowTags: (show: boolean) => Promise<void>;
  toggleShowTags: () => Promise<void>;
  replaceAllNotes: (newNotes: Note[]) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showTags, setShowTagsState] = useState<boolean>(true);

  const normalizeRemoteUri = (uri: string) => uri.trim().replace(/^`+|`+$/g, '');

  const getMimeTypeFromUri = (uri: string) => {
    const cleaned = uri.split('?')[0].toLowerCase();
    if (cleaned.endsWith('.png')) return 'image/png';
    if (cleaned.endsWith('.webp')) return 'image/webp';
    if (cleaned.endsWith('.heic')) return 'image/heic';
    if (cleaned.endsWith('.heif')) return 'image/heif';
    return 'image/jpeg';
  };

  const encodeImageForStorage = async (uri: string) => {
    const normalized = normalizeRemoteUri(uri);
    if (!normalized) return normalized;
    if (normalized.startsWith('data:')) return normalized;
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;

    try {
      const info = await FileSystem.getInfoAsync(normalized);
      if (!info.exists) {
        console.warn('[images] Source image URI does not exist', { uri: normalized });
        return normalized;
      }
      const base64 = await FileSystem.readAsStringAsync(normalized, { encoding: 'base64' });
      const mimeType = getMimeTypeFromUri(normalized);
      console.log('[images] Encoded image for storage', {
        uri: normalized,
        mimeType,
        base64Length: base64.length,
      });
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.warn('[images] Failed to encode image for storage', {
        uri: normalized,
        error: error instanceof Error ? error.message : String(error),
      });
      return normalized;
    }
  };

  const migrateNotesImages = async (parsedNotes: Note[]) => {
    let changed = false;
    let encodedCount = 0;
    const migrated = await Promise.all(
      parsedNotes.map(async (note) => {
        if (!note.images || note.images.length === 0) return note;
        const nextImages = await Promise.all(note.images.map(async (uri) => {
          const next = await encodeImageForStorage(uri);
          if (next !== uri) encodedCount += 1;
          return next;
        }));
        const same =
          nextImages.length === note.images.length &&
          nextImages.every((u, idx) => u === note.images?.[idx]);
        if (!same) changed = true;
        return { ...note, images: nextImages };
      })
    );

    const allImageUris = migrated.flatMap(n => n.images ?? []);
    const dataUriCount = allImageUris.filter(u => typeof u === 'string' && u.startsWith('data:')).length;

    if (changed) {
      console.log('[images] Migrated note images on load', {
        notes: migrated.length,
        encodedCount,
        dataUriCount,
      });
      await saveNotes(migrated);
    } else {
      console.log('[images] No image migration needed on load', {
        notes: migrated.length,
        encodedCount,
        dataUriCount,
      });
    }
    return migrated;
  };

  useEffect(() => {
    loadNotes();
    loadShowTags();
  }, []);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('chronochat_notes');
      if (storedNotes) {
        const parsedNotes: Note[] = JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp),
        }));
        const totalImages = parsedNotes.reduce((acc, n) => acc + (n.images?.length ?? 0), 0);
        const sampleUri = parsedNotes.find(n => n.images && n.images.length > 0)?.images?.[0] ?? null;
        console.log('[images] Loaded notes from storage', {
          notes: parsedNotes.length,
          totalImages,
          sampleUri,
        });
        const migrated = await migrateNotesImages(parsedNotes);
        setNotes(migrated);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('chronochat_notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const loadShowTags = async () => {
    try {
      const stored = await AsyncStorage.getItem('chronochat_show_tags');
      if (stored !== null) {
        setShowTagsState(stored === 'true');
      }
    } catch (error) {
      console.error('Error loading showTags:', error);
    }
  };

  const saveShowTags = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('chronochat_show_tags', value ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving showTags:', error);
    }
  };

  const addNote = async (content: string, tags: string[] = [], images: string[] = [], files: FileAttachment[] = []) => {
    if (images.length > 0) {
      console.log('[images] addNote called with images', {
        count: images.length,
        sampleUri: images[0],
      });
    }
    const encodedImages = await Promise.all(images.map(encodeImageForStorage));
    if (encodedImages.length > 0) {
      const encodedCount = encodedImages.filter((u, idx) => u !== images[idx]).length;
      console.log('[images] addNote encoded images', {
        total: images.length,
        encodedCount,
        sampleEncodedUri: encodedImages[0]?.slice(0, 48),
      });
    }
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      tags,
      images: encodedImages,
      files
    };

    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    await saveNotes(updatedNotes);
  };

  const getNotesByTag = (tag: string) => {
    return notes.filter(note => note.tags.includes(tag));
  };

  const setShowTags = async (show: boolean) => {
    setShowTagsState(show);
    await saveShowTags(show);
  };

  const toggleShowTags = async () => {
    const next = !showTags;
    setShowTagsState(next);
    await saveShowTags(next);
  };

  const replaceAllNotes = async (newNotes: Note[]) => {
    setNotes(newNotes);
    await saveNotes(newNotes);
  };

  return (
    <NoteContext.Provider value={{
      notes,
      addNote,
      deleteNote,
      getNotesByTag,
      showTags,
      setShowTags,
      toggleShowTags,
      replaceAllNotes
    }}>
      {children}
    </NoteContext.Provider>
  );
};
