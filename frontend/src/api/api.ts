import { API } from "../constants";
import { getToken } from "../helpers";

export interface Note {
  id: number;
  text: string;
  created_at: string;
}

export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${API}/notes`, {
    headers: { Authorization: `Bearer ${getToken()}` }, // ← додали токен
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Не вдалося завантажити");
  return res.json();
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Невірний email або пароль");
  const data = await res.json();
  return data.token;
}

export async function createNote(text: string): Promise<Note> {
  const res = await fetch(`${API}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`, // токен береться тут автоматично
    },
    body: JSON.stringify({ text }),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED"); // спецмітка для редіректу
  if (!res.ok) throw new Error("Не вдалося створити");
  return res.json();
}

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<string> {
  const res = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  if (res.status === 409) {
    // Пам'ятаєш наш 409 на бекенді? UNIQUE-конфлікт — ім'я/пошта зайняті.
    throw new Error("Користувач з таким імʼям або поштою вже існує");
  }
  if (!res.ok) {
    throw new Error("Не вдалося зареєструватись");
  }

  const data = await res.json(); // { user, token }
  return data.token;
}

export async function updateNote(id: number, text: string): Promise<Note> {
  const res = await fetch(`${API}/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ text }),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Не вдалося оновити");
  return res.json();
}

export async function deleteNote(id: number): Promise<void> {
  const res = await fetch(`${API}/notes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Не вдалося видалити");
  // DELETE нічого корисного не повертає для UI.
}
