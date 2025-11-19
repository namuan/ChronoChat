import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    loadNotes();
    loadShowTags();
  }, []);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('chronochat_notes');
      if (storedNotes) {
        const parsedNotes = JSON.parse(storedNotes).map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        }));
        setNotes(parsedNotes);
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
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      tags,
      images,
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