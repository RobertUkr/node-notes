import { pool } from "../db";
import { Note } from "../types";

export async function getNotes(
  userId: number,
  search?: string,
): Promise<Note[]> {
  if (search) {
    const result = await pool.query<Note>(
      "SELECT * FROM notes WHERE user_id = $1 AND text ILIKE $2 ORDER BY id",
      [userId, `%${search}%`],
    );
    return result.rows;
  }
  const result = await pool.query<Note>(
    "SELECT * FROM notes WHERE user_id = $1 ORDER BY id",
    [userId],
  );
  return result.rows;
}

// Створення: записуємо власника.
export async function createNote(userId: number, text: string): Promise<Note> {
  const result = await pool.query<Note>(
    "INSERT INTO notes (text, user_id) VALUES ($1, $2) RETURNING *",
    [text, userId],
  );
  return result.rows[0];
}

// Оновлення: тільки якщо нотатка НАЛЕЖИТЬ цьому користувачу.
// WHERE id = $2 AND user_id = $3 — чужу не зачепить (поверне null).
export async function updateNote(
  id: string,
  userId: number,
  text: string,
): Promise<Note | null> {
  const result = await pool.query<Note>(
    "UPDATE notes SET text = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [text, id, userId],
  );
  return result.rows[0] ?? null;
}

// Видалення: так само — тільки свою.
export async function deleteNote(
  id: string,
  userId: number,
): Promise<Note | null> {
  const result = await pool.query<Note>(
    "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId],
  );
  return result.rows[0] ?? null;
}
