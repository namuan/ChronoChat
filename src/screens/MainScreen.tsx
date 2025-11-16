import React, { useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotes } from '../context/NoteContext';
import NoteItem from '../components/NoteItem';
import MessageInputBar from '../components/MessageInputBar';
import TagsFilter from '../components/TagsFilter';
import DaySeparator from '../components/DaySeparator';
import CalendarNavigator from '../components/CalendarNavigator';
import ConfigurationDialog from '../components/ConfigurationDialog';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { Note, FileAttachment } from '../context/NoteContext';
import { pickFile, readFileAsBase64 } from '../utils/filePicker';

export default function MainScreen({ navigation }: any) {
  const { notes, addNote, showTags } = useNotes();
  const [inputText, setInputText] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [configDialogVisible, setConfigDialogVisible] = useState(false);

  const extractTagsFromText = (text: string): { content: string; tags: string[] } => {
    const hashtagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    while ((match = hashtagRegex.exec(text)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    const content = text.replace(hashtagRegex, '').trim();
    return { content, tags: [...new Set(tags)] };
  };

  const handleSendNote = async () => {
    if (inputText.trim() || selectedImages.length > 0 || selectedFiles.length > 0) {
      const { content, tags } = extractTagsFromText(inputText);
      await addNote(content, tags, selectedImages, selectedFiles);
      setInputText('');
      setSelectedImages([]);
      setSelectedFiles([]);
    }
  };

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uris = result.assets.map(a => a.uri);
      setSelectedImages(prev => [...prev, ...uris]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePickFiles = async () => {
    try {
      const picked = await pickFile();
      if (picked) {
        const base64 = await readFileAsBase64(picked.uri);
        const attachment: FileAttachment = {
          uri: picked.uri,
          name: picked.name,
          type: picked.type,
          data: base64,
        };
        setSelectedFiles(prev => [...prev, attachment]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      Alert.alert(
        'File Error',
        error instanceof Error ? error.message : 'Failed to attach file. Please try again.'
      );
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getAllTags = () => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  };

  const availableDates = useMemo(() => {
    const dateSet = new Set<string>();
    notes.forEach(note => {
      dateSet.add(note.timestamp.toDateString());
    });
    return Array.from(dateSet).map(dateStr => new Date(dateStr)).sort((a, b) => b.getTime() - a.getTime());
  }, [notes]);

  const displayNotes = useMemo(() => {
    let filtered = notes;
    
    // Filter by tag if selected
    if (filterTag) {
      filtered = filtered.filter(note => note.tags.includes(filterTag));
    }
    
    return filtered;
  }, [notes, filterTag]);

  const sortedNotes = [...displayNotes].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const dataWithSeparators = React.useMemo(() => {
    const out: ({ type: 'note'; data: Note } | { type: 'separator'; date: Date })[] = [];
    let lastDate: string | null = null;
    // walk from oldest → newest
    const reversed = [...sortedNotes].reverse();
    reversed.forEach(note => {
      const noteDate = note.timestamp.toDateString();
      if (noteDate !== lastDate) {
        out.push({ type: 'separator', date: note.timestamp });
        lastDate = noteDate;
      }
      out.push({ type: 'note', data: note });
    });
    // reverse again so newest is first (bottom when inverted)
    return out.reverse();
  }, [sortedNotes]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.calendarContainer}>
          <CalendarNavigator
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            availableDates={availableDates}
          />
        </View>
        <TouchableOpacity 
          style={styles.configButton} 
          onPress={() => setConfigDialogVisible(true)}
        >
          <Text style={styles.configButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>
      {showTags && <TagsFilter tags={getAllTags()} selectedTag={filterTag} onSelectTag={setFilterTag} />}
      <ConfigurationDialog 
        visible={configDialogVisible} 
        onClose={() => setConfigDialogVisible(false)} 
      />
      <FlatList
        data={dataWithSeparators}
        keyExtractor={(item, idx) => (item.type === 'note' ? item.data.id : item.date.toISOString()) + idx}
        renderItem={({ item }) =>
          item.type === 'separator' ? (
            <DaySeparator date={item.date} />
          ) : (
            <NoteItem note={item.data} />
          )
        }
        contentContainerStyle={styles.notesList}
        inverted
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0) {
            const topItem = viewableItems[0].item;
            if (topItem.type === 'separator') {
              setSelectedDate(topItem.date);
            } else {
              setSelectedDate(topItem.data.timestamp);
            }
          }
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 300,
        }}
      />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <MessageInputBar
          inputText={inputText}
          onChangeText={setInputText}
          onSend={handleSendNote}
          selectedImages={selectedImages}
          onPickImages={handlePickImages}
          onRemoveImage={handleRemoveImage}
          sendDisabled={!inputText.trim()}
          selectedFiles={selectedFiles}
          onPickFiles={handlePickFiles}
          onRemoveFile={handleRemoveFile}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  calendarContainer: {
    flex: 1,
  },
  configButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginLeft: 'auto',
  },
  configButtonText: {
    fontSize: 20,
  },
  notesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  keyboardAvoidingView: {
    width: '100%',
  },
});