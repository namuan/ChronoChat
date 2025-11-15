# ChronoChat iOS - Technical Architecture

## Overview

ChronoChat is a React Native-based iOS note-taking application that allows users to create notes with inline hashtag support. The app follows a simple architecture with local data persistence using AsyncStorage.

## Technology Stack

- **Frontend Framework**: React Native with TypeScript
- **State Management**: React Context API
- **Data Persistence**: @react-native-async-storage/async-storage
- **Navigation**: React Navigation (Stack Navigator)
- **Development Environment**: Expo CLI
- **Platform**: iOS (Expo Go)

## Application Architecture

### Component Structure

```
src/
├── components/
│   ├── NoteItem.tsx          # Individual note display component
│   └── TagInput.tsx          # Legacy tag input component (unused)
├── context/
│   └── NoteContext.tsx       # Global state management for notes
├── screens/
│   ├── MainScreen.tsx        # Primary note-taking interface
│   └── TagTimelineScreen.tsx # Tag-filtered note view
├── App.tsx                   # Root application component
└── index.ts                  # Application entry point
```

### Key Components

#### 1. NoteContext (`src/context/NoteContext.tsx`)
- **Purpose**: Manages global note state and data persistence
- **Key Functions**:
  - `addNote(content, tags)`: Creates new notes with extracted hashtags
  - `deleteNote(id)`: Removes notes by ID
  - `getNotesByTag(tag)`: Filters notes by tag
  - `loadNotes()`: Loads persisted notes from AsyncStorage
  - `saveNotes(notes)`: Persists notes to AsyncStorage

#### 2. MainScreen (`src/screens/MainScreen.tsx`)
- **Purpose**: Primary user interface for note creation and display
- **Key Features**:
  - Inline hashtag parsing from message content
  - Real-time note display with chronological sorting
  - Tag-based filtering system
  - Clean, chat-like interface

#### 3. NoteItem (`src/components/NoteItem.tsx`)
- **Purpose**: Renders individual note items
- **Features**:
  - Note content display
  - Tag visualization
  - Timestamp formatting
  - Delete functionality with confirmation

## Data Architecture

### Note Data Structure

```typescript
interface Note {
  id: string;           // Unique identifier (timestamp-based)
  content: string;      // Note text content (hashtags removed)
  timestamp: Date;      // Creation timestamp
  tags: string[];       // Array of extracted hashtag names
}
```

### Data Flow

1. **Note Creation**:
   - User types message with inline hashtags (e.g., "Meeting with #team about #project")
   - `extractTagsFromText()` function parses hashtags using regex `/#(\w+)/g`
   - Content is cleaned (hashtags removed) and stored separately from tags
   - Note is saved to AsyncStorage and added to global state

2. **Note Display**:
   - Notes are sorted chronologically (newest first)
   - Tags are displayed below each note content
   - Tag filtering allows viewing notes by specific hashtags

3. **Data Persistence**:
   - All notes are serialized to JSON and stored in AsyncStorage
   - Key: `"chronochat_notes"`
   - Automatic loading on app startup
   - Automatic saving on note creation/deletion

## iOS Data Storage

### Storage Location

On iOS devices, AsyncStorage data is stored in the application's sandboxed file system:

```
/Library/Application Support/[Bundle ID]/RCTAsyncLocalStorage_V1/
```

Where `[Bundle ID]` is your app's unique identifier (e.g., `com.yourcompany.chronochat`).

### Storage Details

- **Storage Type**: Key-value pairs in JSON format
- **Persistence**: Data persists across app launches and device restarts
- **Backup**: Included in iCloud/iTunes device backups
- **Security**: Data is stored in the app's sandbox, isolated from other apps
- **Size Limitations**: No hard limit, but recommended to keep under 6MB for performance

### Data Format

Notes are stored as a JSON array:
```json
[
  {
    "id": "1234567890123",
    "content": "Meeting with about the timeline",
    "timestamp": "2023-11-15T10:30:00.000Z",
    "tags": ["team", "project"]
  }
]
```

## Hashtag Processing

### Regex Pattern
- **Pattern**: `/#(\w+)/g`
- **Matches**: Words starting with # (e.g., #team, #project)
- **Extraction**: Captures the word after # without the symbol
- **Processing**: Tags are converted to lowercase, duplicates removed

### Processing Pipeline
1. User input: `"Great meeting with #Team about the #PROJECT timeline"`
2. Regex extraction: `["Team", "PROJECT"]`
3. Normalization: `["team", "project"]`
4. Deduplication: `["team", "project"]`
5. Content cleaning: `"Great meeting with about the timeline"`
6. Storage: Content and tags stored separately

## Performance Considerations

- **AsyncStorage**: All operations are asynchronous to prevent UI blocking
- **State Updates**: React Context provides efficient state management
- **Rendering**: FlatList with keyExtractor for optimal list performance
- **Memory**: Notes are kept in memory for fast access, persisted to storage

## Security Considerations

- **Data Isolation**: iOS sandboxing prevents other apps from accessing data
- **No Encryption**: Data is stored in plain text (consider encryption for sensitive data)
- **Local Only**: No cloud sync or external data transmission
- **Backup**: Data is included in device backups

## Development Notes

- **Expo Go**: Used for development and testing
- **Hot Reloading**: Supports real-time code changes during development
- **TypeScript**: Full type safety throughout the application
- **Error Handling**: Basic error handling for storage operations

## Future Enhancements

Potential improvements that could be implemented:
- Data encryption for sensitive notes
- Cloud synchronization
- Search functionality
- Rich text formatting
- Image attachments
- Export/import functionality (removed for now)
- Biometric authentication