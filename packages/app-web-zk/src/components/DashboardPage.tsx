import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { noteService } from '../services/noteService';
import type { Note } from '../types';
import NotesList from './NotesList';
import NoteEditor from './NoteEditor';
import Sidebar from './Sidebar';

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const fetchedNotes = await noteService.getAllNotes();
      setNotes(fetchedNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await noteService.createNote({
        title: 'Untitled Note',
        content: '',
      });
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await noteService.updateNote(id, updates);
      setNotes(notes.map(note => note.id === id ? updatedNote : note));
      if (selectedNote?.id === id) {
        setSelectedNote(updatedNote);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      onLogout();
    }
  };

  return (
    <div className="dashboard">
      <Sidebar 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />

      <div className={`dashboard-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="notes-panel">
          <div className="notes-panel-header">
            <h2>Notes</h2>
            <button className="btn btn-primary" onClick={handleCreateNote}>
              + New Note
            </button>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Decrypting your notes...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={loadNotes}>Retry</button>
            </div>
          ) : (
            <NotesList 
              notes={notes}
              selectedNote={selectedNote}
              onSelectNote={setSelectedNote}
            />
          )}
        </div>

        <div className="editor-panel">
          {selectedNote ? (
            <NoteEditor 
              note={selectedNote}
              onUpdate={(updates) => handleUpdateNote(selectedNote.id, updates)}
              onDelete={() => handleDeleteNote(selectedNote.id)}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h3>No note selected</h3>
              <p>Select a note from the list or create a new one</p>
              <button className="btn btn-primary" onClick={handleCreateNote}>
                Create New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
