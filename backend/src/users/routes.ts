import { Request, Response, Router } from "express";
import { loginUser, registerUser } from "../users/service";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  // Валідація — усі три поля обов'язкові.
  if (!username || !email || !password) {
    res.status(400).json({ error: "username, email і password обовʼязкові" });
    return;
  }

  // Мінімальна перевірка пароля. У проді додають більше правил.
  if (password.length < 6) {
    res
      .status(400)
      .json({ error: "Пароль має бути не коротший за 6 символів" });
    return;
  }

  try {
    const { user, token } = await registerUser(username, email, password);
    res.status(201).json({ user, token }); // повертаємо публічні дані та токен
  } catch (err: any) {
    // Код '23505' у Postgres = порушення UNIQUE (ім'я або пошта вже зайняті).
    // Ось де спрацьовує наш UNIQUE CONSTRAINT з таблиці!
    if (err.code === "23505") {
      res
        .status(409)
        .json({ error: "Користувач з таким імʼям або поштою вже існує" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Помилка бази даних" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email і password обовʼязкові" });
    return;
  }

  try {
    const token = await loginUser(email, password);

    // null = або email не знайдено, або пароль невірний.
    // ВАЖЛИВО: не кажемо, ЩО САМЕ не так — це навмисно.
    if (!token) {
      res.status(401).json({ error: "Невірний email або пароль" });
      return;
    }

    res.json({ token }); // віддаємо браслет
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка сервера" });
  }
});

export default router;
