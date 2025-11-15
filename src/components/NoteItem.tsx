import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useNotes } from '../context/NoteContext';
import { Note, FileAttachment } from '../context/NoteContext';
import ImageViewerModal from './ImageViewerModal';

interface NoteItemProps {
  note: Note;
}

export default function NoteItem({ note }: NoteItemProps) {
  const { deleteNote } = useNotes();
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteNote(note.id) }
      ]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleImagePress = (uri: string) => {
    setViewerUri(uri);
  };

  const closeViewer = () => {
    setViewerUri(null);
  };

  const fileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎞️';
    if (type.startsWith('audio/')) return '🔊';
    if (type.includes('pdf')) return '📄';
    if (type.includes('sheet') || type.includes('excel')) return '📊';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📎';
  };

  return (
    <View style={styles.container}>
      <View style={styles.noteContent}>
        {note.images && note.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {note.images.map((uri, index) => (
              <TouchableOpacity key={index} onPress={() => handleImagePress(uri)}>
                <Image source={{ uri }} style={styles.noteImage} />
              </TouchableOpacity>
            ))}
          </View>
        )}
        {note.files && note.files.length > 0 && (
          <View style={styles.filesContainer}>
            {note.files.map((f, idx) => (
              <View key={idx} style={styles.fileChip}>
                <Text style={styles.fileIcon}>{fileIcon(f.type)}</Text>
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.noteText}>{note.content}</Text>
        {note.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {note.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.footer}>
          <Text style={styles.timestamp}>{formatTime(note.timestamp)}</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ImageViewerModal visible={!!viewerUri} imageUri={viewerUri} onClose={closeViewer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  noteContent: {
    backgroundColor: '#007bff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noteText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  noteImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  filesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  fileIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  fileName: {
    color: '#fff',
    fontSize: 12,
    maxWidth: 120,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: 12,
  },
  deleteButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
});