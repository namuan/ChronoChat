import React from 'react';
import { View, FlatList, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';

interface ImagePreviewRowProps {
  images: string[];
  onRemove: (index: number) => void;
}

function ImagePreviewRow({ images, onRemove }: ImagePreviewRowProps) {
  if (images.length === 0) return null;

  return (
    <View style={styles.imagePreviewRow}>
      <FlatList
        data={images}
        horizontal
        keyExtractor={(uri, idx) => uri + idx}
        renderItem={({ item, index }) => (
          <View style={styles.imagePreviewItem}>
            <Image source={{ uri: item }} style={styles.imagePreviewThumb} />
            <TouchableOpacity style={styles.imageRemove} onPress={() => onRemove(index)}>
              <Text style={styles.imageRemoveText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagePreviewContent}
      />
    </View>
  );
}

export default ImagePreviewRow;

const styles = StyleSheet.create({
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
});