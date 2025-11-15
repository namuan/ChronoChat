import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import ImagePreviewRow from './ImagePreviewRow';

import { FileAttachment } from '../context/NoteContext';

interface MessageInputBarProps {
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  selectedImages: string[];
  onPickImages: () => void;
  onRemoveImage: (index: number) => void;
  selectedFiles: FileAttachment[];
  onPickFiles: () => void;
  onRemoveFile: (index: number) => void;
  sendDisabled?: boolean;
}

export default function MessageInputBar({
  inputText,
  onChangeText,
  onSend,
  selectedImages,
  onPickImages,
  onRemoveImage,
  selectedFiles,
  onPickFiles,
  onRemoveFile,
  sendDisabled = false,
}: MessageInputBarProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.inputContainer}
    >
      <ImagePreviewRow images={selectedImages} onRemove={onRemoveImage} />
      {selectedFiles.length > 0 && (
        <View style={styles.filesRow}>
          {selectedFiles.map((f, idx) => (
            <View key={idx} style={styles.fileChip}>
              <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
              <TouchableOpacity onPress={() => onRemoveFile(idx)}>
                <Text style={styles.fileRemove}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={onChangeText}
          placeholder="Type your note here..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          editable={true}
        />
        <TouchableOpacity style={styles.cameraButton} onPress={onPickImages}>
          <Text style={styles.cameraButtonText}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.attachButton} onPress={onPickFiles}>
          <Text style={styles.attachButtonText}>📎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={sendDisabled}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  attachButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
  },
  attachButtonText: {
    fontSize: 18,
    color: '#212529',
  },
  filesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 8,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  fileName: {
    fontSize: 13,
    color: '#212529',
    maxWidth: 120,
    marginRight: 6,
  },
  fileRemove: {
    fontSize: 14,
    color: '#6c757d',
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