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

  const getImagesDir = () => {
    const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? '';
    return base ? base + 'images/' : '';
  };

  const ensureImagesDir = async () => {
    const dir = getImagesDir();
    if (!dir) return;
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }
  };

  const getUriExtension = (uri: string) => {
    const cleaned = uri.split('?')[0];
    const lastDot = cleaned.lastIndexOf('.');
    if (lastDot === -1) return 'jpg';
    const ext = cleaned.slice(lastDot + 1).toLowerCase();
    if (!ext || ext.length > 6) return 'jpg';
    return ext;
  };

  const persistImageUri = async (uri: string) => {
    const imagesDir = getImagesDir();
    const docDir = FileSystem.documentDirectory ?? '';
    if (!imagesDir || !docDir) return uri;
    if (uri.startsWith(imagesDir) || uri.startsWith(docDir + 'imported_images/')) return uri;

    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (!info.exists) return uri;

      await ensureImagesDir();
      const ext = getUriExtension(uri);
      const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const dest = imagesDir + filename;
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch {
      return uri;
    }
  };

  const migrateNotesImages = async (parsedNotes: Note[]) => {
    let changed = false;
    const migrated = await Promise.all(
      parsedNotes.map(async (note) => {
        if (!note.images || note.images.length === 0) return note;
        const nextImages = await Promise.all(note.images.map(persistImageUri));
        const same =
          nextImages.length === note.images.length &&
          nextImages.every((u, idx) => u === note.images?.[idx]);
        if (!same) changed = true;
        return { ...note, images: nextImages };
      })
    );
    if (changed) {
      await saveNotes(migrated);
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
    const persistedImages = await Promise.all(images.map(persistImageUri));
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      tags,
      images: persistedImages,
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
