import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotes } from '../context/NoteContext';
import NoteItem from '../components/NoteItem';
import MessageInputBar from '../components/MessageInputBar';
import TagsFilter from '../components/TagsFilter';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export default function MainScreen({ navigation }: any) {
  const { notes, addNote } = useNotes();
  const [inputText, setInputText] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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
    if (inputText.trim() || selectedImages.length > 0) {
      const { content, tags } = extractTagsFromText(inputText);
      await addNote(content, tags, selectedImages);
      setInputText('');
      setSelectedImages([]);
    }
  };

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photos to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const getAllTags = () => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  };

  const displayNotes = filterTag ? notes.filter(note => note.tags.includes(filterTag)) : notes;
  const sortedNotes = [...displayNotes].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <SafeAreaView style={styles.container}>
      <TagsFilter tags={getAllTags()} selectedTag={filterTag} onSelectTag={setFilterTag} />
      <FlatList
        data={sortedNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteItem note={item} />}
        contentContainerStyle={styles.notesList}
        inverted
        showsVerticalScrollIndicator={false}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <MessageInputBar
          inputText={inputText}
          onChangeText={setInputText}
          onSend={handleSendNote}
          selectedImages={selectedImages}
          onPickImages={handlePickImages}
          onRemoveImage={handleRemoveImage}
          sendDisabled={!inputText.trim() && selectedImages.length === 0}
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
  notesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});