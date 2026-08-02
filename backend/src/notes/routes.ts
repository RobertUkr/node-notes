import { Request, Response, Router } from "express";
import { requireAuth } from "../auth/middleware";
import { createNote, deleteNote, getNotes, updateNote } from "./service";

// Router — це "міні-app" Express, куди вішають групу роутів.
const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  try {
    const notes = await getNotes(req.userId!, search); // ! бо requireAuth гарантує userId
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка бази даних" });
  }
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text || text.trim() === "") {
    res.status(400).json({ error: "Поле text обовʼязкове" });
    return;
  }
  try {
    const note = await createNote(req.userId!, text);
    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка бази даних" });
  }
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const { text } = req.body;
  if (!text || text.trim() === "") {
    res.status(400).json({ error: "Поле text обовʼязкове" });
    return;
  }
  try {
    const note = await updateNote(id, req.userId!, text);
    if (!note) {
      res.status(404).json({ error: "Нотатку не знайдено" });
      return;
    }
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка бази даних" });
  }
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const note = await deleteNote(id, req.userId!);
    if (!note) {
      res.status(404).json({ error: "Нотатку не знайдено" });
      return;
    }
    res.json({ deleted: note });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка бази даних" });
  }
});

export default router;
