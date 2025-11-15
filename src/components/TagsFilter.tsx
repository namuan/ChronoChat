import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TagsFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export default function TagsFilter({ tags, selectedTag, onSelectTag }: TagsFilterProps) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.tagsFilter}>
      <TouchableOpacity
        style={[styles.tagFilterButton, !selectedTag && styles.tagFilterButtonActive]}
        onPress={() => onSelectTag(null)}
      >
        <Text style={[styles.tagFilterText, !selectedTag && styles.tagFilterTextActive]}>All</Text>
      </TouchableOpacity>
      {tags.map(tag => (
        <TouchableOpacity
          key={tag}
          style={[styles.tagFilterButton, selectedTag === tag && styles.tagFilterButtonActive]}
          onPress={() => onSelectTag(selectedTag === tag ? null : tag)}
        >
          <Text style={[styles.tagFilterText, selectedTag === tag && styles.tagFilterTextActive]}>#{tag}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
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
});