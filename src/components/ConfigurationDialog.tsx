import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import { useNotes } from '../context/NoteContext';
import { createBackup, restoreBackup } from '../utils/backupService';
import { Alert } from 'react-native';

interface ConfigurationDialogProps {
  visible: boolean;
  onClose: () => void;
}

export default function ConfigurationDialog({ visible, onClose }: ConfigurationDialogProps) {
  const { showTags, setShowTags, notes, replaceAllNotes } = useNotes();

  const toggleTagsVisibility = (value: boolean) => {
    setShowTags(value);
  };

  const handleBackup = async () => {
    try {
      await createBackup(notes);
    } catch (error) {
      Alert.alert('Backup Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      'Restore Backup',
      'This will replace all your current notes with the backup data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const restoredNotes = await restoreBackup();
              await replaceAllNotes(restoredNotes);
              Alert.alert('Success', 'Notes restored successfully');
              onClose();
            } catch (error) {
              if (error instanceof Error && error.message === 'Restore cancelled') {
                return;
              }
              Alert.alert('Restore Failed', error instanceof Error ? error.message : 'Unknown error occurred');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Configuration</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.dialogContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Show Tags</Text>
                <Text style={styles.settingDescription}>
                  Display tags in notes and filter bar
                </Text>
              </View>
              <Switch
                value={showTags}
                onValueChange={toggleTagsVisibility}
                trackColor={{ false: '#767577', true: '#007bff' }}
                thumbColor={showTags ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Data Management</Text>
            </View>

            <TouchableOpacity style={styles.actionButton} onPress={handleBackup}>
              <Text style={styles.actionButtonText}>Backup to File / iCloud</Text>
              <Text style={styles.actionButtonIcon}>☁️</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleRestore}>
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Restore from File</Text>
              <Text style={styles.actionButtonIcon}>🔄</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.dialogFooter}>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6c757d',
    fontWeight: '300',
  },
  dialogContent: {
    maxHeight: 300,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  dialogFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  doneButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
    backgroundColor: '#fff',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#212529',
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  dangerButton: {
    marginTop: 0,
  },
  dangerButtonText: {
    color: '#dc3545',
  },
});