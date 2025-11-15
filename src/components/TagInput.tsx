import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export default function TagInput({ selectedTags, onTagsChange }: TagInputProps) {
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !selectedTags.includes(tagInput.trim())) {
      onTagsChange([...selectedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <View style={styles.container}>
      {selectedTags.length > 0 && (
        <View style={styles.selectedTags}>
          {selectedTags.map((tag, index) => (
            <View key={index} style={styles.selectedTag}>
              <Text style={styles.selectedTagText}>#{tag}</Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={tagInput}
          onChangeText={setTagInput}
          placeholder="Add tags..."
          placeholderTextColor="#999"
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, !tagInput.trim() && styles.addButtonDisabled]}
          onPress={addTag}
          disabled={!tagInput.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  selectedTagText: {
    color: '#495057',
    fontSize: 14,
    marginRight: 4,
  },
  removeButton: {
    paddingHorizontal: 2,
  },
  removeButtonText: {
    color: '#6c757d',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#212529',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#28a745',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});