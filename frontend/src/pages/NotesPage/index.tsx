import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createNote,
  deleteNote,
  fetchNotes,
  updateNote,
  type Note,
} from "../../api/api";
import { clearToken } from "../../helpers";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newText, setNewText] = useState("");
  // Який рядок редагується (id) і чернетка тексту в ньому.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes()
      .then(setNotes)
      .catch((err) => {
        if (err.message === "UNAUTHORIZED") {
          clearToken(); // чистимо мертвий токен
          navigate("/login"); // на логін
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    try {
      const created = await createNote(newText);
      setNotes((prev) => [...prev, created]);
      setNewText("");
    } catch (err: any) {
      // Якщо токен протух — api кинув 'UNAUTHORIZED' → на логін.
      if (err.message === "UNAUTHORIZED") {
        clearToken();
        navigate("/login");
      }
    }
  }
  // Спільний хелпер: якщо дія впала через протухлий токен — на логін.
  function handleAuthError(err: any) {
    if (err.message === "UNAUTHORIZED") {
      clearToken();
      navigate("/login");
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteNote(id);
      // Прибираємо з локального списку без перезапиту.
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      handleAuthError(err);
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id); // вмикаємо режим редагування для цього рядка
    setEditText(note.text); // підставляємо поточний текст у поле
  }

  async function handleUpdate(id: number) {
    try {
      const updated = await updateNote(id, editText);
      // Замінюємо оновлену нотатку в списку.
      setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setEditingId(null); // виходимо з режиму редагування
    } catch (err) {
      handleAuthError(err);
    }
  }

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <>
      <div
        style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>My Notes</h1>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div style={{ marginBottom: 20 }}>
              <input
                placeholder="нова нотатка"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
              <button onClick={handleCreate}>Додати</button>
            </div>
            <ul>
              {notes.map((note) => (
                <li key={note.id} style={{ marginBottom: 8 }}>
                  {editingId === note.id ? (
                    // Режим редагування цього рядка
                    <>
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <button onClick={() => handleUpdate(note.id)}>
                        Зберегти
                      </button>
                      <button onClick={() => setEditingId(null)}>
                        Скасувати
                      </button>
                    </>
                  ) : (
                    // Звичайний перегляд
                    <>
                      <span>{note.text}</span>
                      <button
                        onClick={() => startEdit(note)}
                        style={{ marginLeft: 8 }}
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        style={{ marginLeft: 4 }}
                      >
                        Видалити
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
