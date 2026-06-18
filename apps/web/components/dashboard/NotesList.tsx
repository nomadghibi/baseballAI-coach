"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import type { Note } from "@/lib/types"

interface NotesListProps {
  sessionId: string
  initialNotes: Note[]
}

export default function NotesList({ sessionId, initialNotes }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [draft, setDraft] = useState("")
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [error, setError] = useState("")

  async function handleAdd() {
    if (!draft.trim()) return
    setSaving(true)
    setError("")
    try {
      const note = await api.notes.create(sessionId, draft.trim())
      setNotes((n) => [...n, note])
      setDraft("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(noteId: string) {
    if (!editText.trim()) return
    try {
      const updated = await api.notes.update(noteId, editText.trim())
      setNotes((n) => n.map((x) => (x.id === noteId ? updated : x)))
      setEditId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update")
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Delete this note?")) return
    try {
      await api.notes.delete(noteId)
      setNotes((n) => n.filter((x) => x.id !== noteId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete")
    }
  }

  function startEdit(note: Note) {
    setEditId(note.id)
    setEditText(note.note)
  }

  return (
    <div className="space-y-3">
      {notes.length === 0 && (
        <p className="text-sm text-gray-400">No notes yet. Add coaching observations below.</p>
      )}

      {notes.map((note) => (
        <div key={note.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          {editId === note.id ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(note.id)}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.note}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(note.created_at)}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => startEdit(note)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add note */}
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add coaching observation or parent note…"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.metaKey) handleAdd()
          }}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={saving || !draft.trim()}
          className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : "Add note"}
        </button>
        <p className="text-xs text-gray-400">Tip: ⌘+Enter to save quickly</p>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })
}
