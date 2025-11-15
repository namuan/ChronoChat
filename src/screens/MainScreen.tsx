import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { useNotes } from '../context/NoteContext';
import NoteItem from '../components/NoteItem';

export default function MainScreen({ navigation }: any) {
  const { notes, addNote } = useNotes();
  const [inputText, setInputText] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const extractTagsFromText = (text: string): { content: string; tags: string[] } => {
    // Find all hashtags in the text (words starting with #)
    const hashtagRegex = /#(\w+)/g;
    const tags: string[] = [];
    let match;
    
    while ((match = hashtagRegex.exec(text)) !== null) {
      tags.push(match[1].toLowerCase());
    }
    
    // Remove hashtags from content but keep the rest of the text
    const content = text.replace(hashtagRegex, '').trim();
    
    return {
      content,
      tags: [...new Set(tags)] // Remove duplicates
    };
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
    notes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  const displayNotes = filterTag 
    ? notes.filter(note => note.tags.includes(filterTag))
    : notes;

  const sortedNotes = [...displayNotes].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {getAllTags().length > 0 && (
        <View style={styles.tagsFilter}>
          <TouchableOpacity
            style={[styles.tagFilterButton, !filterTag && styles.tagFilterButtonActive]}
            onPress={() => setFilterTag(null)}
          >
            <Text style={[styles.tagFilterText, !filterTag && styles.tagFilterTextActive]}>All</Text>
          </TouchableOpacity>
          {getAllTags().map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagFilterButton, filterTag === tag && styles.tagFilterButtonActive]}
              onPress={() => setFilterTag(filterTag === tag ? null : tag)}
            >
              <Text style={[styles.tagFilterText, filterTag === tag && styles.tagFilterTextActive]}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <FlatList
        data={sortedNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteItem note={item} />}
        contentContainerStyle={styles.notesList}
        inverted
        showsVerticalScrollIndicator={false}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        {selectedImages.length > 0 && (
          <View style={styles.imagePreviewRow}>
            <FlatList
              data={selectedImages}
              horizontal
              keyExtractor={(uri, idx) => uri + idx}
              renderItem={({ item, index }) => (
                <View style={styles.imagePreviewItem}>
                  <Image source={{ uri: item }} style={styles.imagePreviewThumb} />
                  <TouchableOpacity style={styles.imageRemove} onPress={() => handleRemoveImage(index)}>
                    <Text style={styles.imageRemoveText}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imagePreviewContent}
            />
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your note here..."
            placeholderTextColor="#999"
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={handlePickImages}
          >
            <Text style={styles.cameraButtonText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() && selectedImages.length === 0) && styles.sendButtonDisabled]}
            onPress={handleSendNote}
            disabled={!inputText.trim() && selectedImages.length === 0}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  tagsFilter: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagFilterButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  tagFilterButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  tagFilterText: {
    color: '#6c757d',
    fontSize: 14,
    fontWeight: '500',
  },
  tagFilterTextActive: {
    color: '#fff',
  },
  notesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imagePreviewRow: {
    paddingBottom: 8,
  },
  imagePreviewContent: {
    paddingHorizontal: 0,
  },
  imagePreviewItem: {
    position: 'relative',
    marginRight: 8,
  },
  imagePreviewThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imageRemove: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoveText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cameraButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
  },
  cameraButtonText: {
    fontSize: 18,
    color: '#212529',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});