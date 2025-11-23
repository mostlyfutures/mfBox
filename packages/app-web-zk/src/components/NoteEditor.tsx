import React, { useState, useEffect } from 'react';
import type { Note } from '../types';

interface NoteEditorProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
  onDelete: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdate, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        handleSave();
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [title, content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate({ title, content });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete();
    }
  };

  const formatSaveTime = (date: Date | null): string => {
    if (!date) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 5) return 'Saved just now';
    if (diffSeconds < 60) return `Saved ${diffSeconds}s ago`;
    
    return `Saved at ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="note-editor">
      <div className="note-editor-header">
        <div className="note-editor-status">
          <span className="encryption-badge">🔒 Encrypted</span>
          {isSaving ? (
            <span className="save-status saving">Saving...</span>
          ) : lastSaved ? (
            <span className="save-status saved">{formatSaveTime(lastSaved)}</span>
          ) : null}
        </div>

        <div className="note-editor-actions">
          <button className="btn btn-icon" title="Delete note" onClick={handleDelete}>
            🗑️
          </button>
        </div>
      </div>

      <div className="note-editor-content">
        <input
          type="text"
          className="note-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
        />

        <textarea
          className="note-content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your encrypted note..."
        />
      </div>

      <div className="note-editor-footer">
        <small className="note-info">
          Created: {new Date(note.createdAt).toLocaleString()}
        </small>
        <small className="note-info">
          Last modified: {new Date(note.updatedAt).toLocaleString()}
        </small>
      </div>
    </div>
  );
};

export default NoteEditor;
