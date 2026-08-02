const express = require("express");

const app = express();

// ── MIDDLEWARE ──
app.use(express.json());

// Сховище
const notes = [];
let nextId = 1;

// ── РОУТИ ──

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/notes", (req, res) => {
  const { search } = req.query;

  if (search) {
    const filtered = notes.filter((note) =>
      note.text.toLowerCase().includes(search.toLowerCase()),
    );
    res.json(filtered);
  } else {
    res.json(notes);
  }
});

app.post("/notes", (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === " ") {
    res.status(400).json({ error: "Text field is required!" });
  }

  const note = {
    id: nextId,
    text,
    createdAt: new Date().toISOString,
  };

  notes.push(note);
  nextId++;

  res.status(201).json(note);
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found!" });
});

app.listen(3001, () => {
  console.log("Express server is working: http://localhost:3001");
});
