import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import ImagePreviewRow from './ImagePreviewRow';

import { FileAttachment } from '../context/NoteContext';
import { useState } from 'react';
import { openFilePreview } from '../utils/filePreview';

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
  const [showActions, setShowActions] = useState(false);
  const [pressedFile, setPressedFile] = useState<string | null>(null);

  const handleFilePreview = async (file: FileAttachment) => {
    try {
      await openFilePreview(file.uri, file.name, file.type);
    } catch (error) {
      console.error('Error previewing file:', error);
    }
  };

  const handleFilePressIn = (fileName: string) => {
    setPressedFile(fileName);
  };

  const handleFilePressOut = () => {
    setPressedFile(null);
  };

  return (
    <View style={styles.inputContainer}>
      <ImagePreviewRow images={selectedImages} onRemove={onRemoveImage} />
      {selectedFiles.length > 0 && (
        <View style={styles.filesRow}>
          {selectedFiles.map((f, idx) => (
            <View key={idx} style={styles.fileChipContainer}>
              <TouchableOpacity 
                style={[
                  styles.fileChip,
                  pressedFile === f.name && styles.fileChipActive
                ]}
                onPress={() => handleFilePreview(f)}
                onPressIn={() => handleFilePressIn(f.name)}
                onPressOut={handleFilePressOut}
                activeOpacity={0.8}
              >
                <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onRemoveFile(idx)} style={styles.removeButton}>
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
          autoCorrect={true}
          autoCapitalize="sentences"
          textContentType="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={() => setShowActions(v => !v)}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
        {inputText.trim().length > 0 && (
          <TouchableOpacity
            style={[styles.sendButton, sendDisabled && styles.sendButtonDisabled]}
            onPress={onSend}
            disabled={sendDisabled}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
      {showActions && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={onPickImages}>
            <Text style={styles.actionButtonText}>📷 Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onPickFiles}>
            <Text style={styles.actionButtonText}>📎 File</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20, // Add extra bottom padding for keyboard spacing
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
  addButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 18,
    color: '#212529',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  actionButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#212529',
  },
  filesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 8,
  },
  fileChipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 6,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    opacity: 0.9,
  },
  fileChipActive: {
    opacity: 1,
    backgroundColor: '#dee2e6',
    borderColor: '#adb5bd',
  },
  fileName: {
    fontSize: 13,
    color: '#212529',
    maxWidth: 120,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  fileRemove: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
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