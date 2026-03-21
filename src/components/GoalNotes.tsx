"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Note {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

export default function GoalNotes({
  goalId,
  username,
}: {
  goalId: string;
  username: string;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowser();

  useEffect(() => {
    const fetchNotes = async () => {
      const { data } = await supabase
        .from("goal_notes")
        .select("*")
        .eq("goal_id", goalId)
        .order("created_at", { ascending: true });
      setNotes(data || []);
      setLoading(false);
    };
    fetchNotes();
  }, [goalId, supabase]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const { data, error } = await supabase
      .from("goal_notes")
      .insert({ goal_id: goalId, content: newNote.trim(), author: username })
      .select()
      .single();
    if (!error && data) {
      setNotes([...notes, data]);
      setNewNote("");
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from("goal_notes")
      .delete()
      .eq("id", id);
    if (!error) {
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="ml-8 mt-1 p-2 text-sm text-gray-600">Loading...</div>
    );
  }

  return (
    <div className="ml-8 mt-1 border-l-2 border-card-border pl-3 pb-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex items-start gap-2 py-1.5 text-sm group"
        >
          <div className="flex-1">
            <span className="text-purple-light font-medium text-xs">
              {note.author}
            </span>
            <span className="text-gray-500 text-xs ml-2">
              {new Date(note.created_at).toLocaleDateString()}
            </span>
            <p className="text-gray-300 mt-0.5">{note.content}</p>
          </div>
          <button
            onClick={() => deleteNote(note.id)}
            className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNote()}
          placeholder="Add a note..."
          className="flex-1 bg-input-bg border border-card-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-gray-600 focus:outline-none focus:border-purple"
        />
        <button
          onClick={addNote}
          className="px-3 py-1.5 bg-purple/20 hover:bg-purple/40 text-purple-light text-xs rounded transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}
