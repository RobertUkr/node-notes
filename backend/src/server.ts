import cors from "cors";
import express from "express";
import notesRouter from "./notes/routes";
import usersRouter from "./users/routes";

const app = express();

// CORS ДО роутів. Поки що дозволяємо саме адресу нашого фронту.
app.use(
  cors({
    origin: "http://localhost:5173", // звідки дозволяємо запити
  }),
);

app.use(express.json());

// Усі роути з notesRouter підключаються під префіксом /notes.
// Тому всередині роутера шляхи були '/' та '/:id'.
app.use("/notes", notesRouter);

// health лишаємо тут — він простий і ні до чого не належить.
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// реєстрація буде на POST /auth/register
app.use("/auth", usersRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`TS-сервер працює: http://localhost:${PORT}`);
});
