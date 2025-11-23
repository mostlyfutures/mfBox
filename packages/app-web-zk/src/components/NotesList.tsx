import React from 'react';
import type { Note } from '../types';

interface NotesListProps {
  notes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
}

const NotesList: React.FC<NotesListProps> = ({ notes, selectedNote, onSelectNote }) => {
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 100): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (notes.length === 0) {
    return (
      <div className="notes-list-empty">
        <p>No notes yet. Create your first encrypted note!</p>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {notes.map(note => (
        <div
          key={note.id}
          className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
          onClick={() => onSelectNote(note)}
        >
          <div className="note-item-header">
            <h3 className="note-item-title">{note.title || 'Untitled'}</h3>
            <span className="note-item-encryption">🔒</span>
          </div>
          
          <p className="note-item-preview">
            {truncateContent(note.content || 'No content')}
          </p>
          
          <div className="note-item-footer">
            <span className="note-item-date">{formatDate(note.updatedAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
