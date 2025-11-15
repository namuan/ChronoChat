import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotes } from '../context/NoteContext';
import NoteItem from '../components/NoteItem';

export default function TagTimelineScreen({ route, navigation }: any) {
  const { tag } = route.params;
  const { getNotesByTag } = useNotes();
  const notesByTag = getNotesByTag(tag);

  const sortedNotes = [...notesByTag].sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>#{tag}</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <FlatList
        data={sortedNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NoteItem note={item} />}
        contentContainerStyle={styles.notesList}
        inverted
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes with this tag yet</Text>
          </View>
        }
      />
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
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  notesList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#6c757d',
    fontSize: 16,
  },
});