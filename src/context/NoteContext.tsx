import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  content: string;
  timestamp: Date;
  tags: string[];
}

interface NoteContextType {
  notes: Note[];
  addNote: (content: string, tags?: string[]) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNotesByTag: (tag: string) => Note[];
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

  useEffect(() => {
    loadNotes();
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

  const addNote = async (content: string, tags: string[] = []) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      tags
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

  return (
    <NoteContext.Provider value={{
      notes,
      addNote,
      deleteNote,
      getNotesByTag
    }}>
      {children}
    </NoteContext.Provider>
  );
};