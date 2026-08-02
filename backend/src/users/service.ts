import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { PublicUser, User } from "../types";

// Скільки "раундів" хешування. 10 — стандарт: досить повільно проти брутфорсу,
// досить швидко для користувача. Що більше — тим повільніше й безпечніше.
const SALT_ROUNDS = 10;

export async function registerUser(
  username: string,
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string }> {
  // ── ХЕШУВАННЯ ──
  // bcrypt.hash перетворює пароль на незворотний хеш виду $2b$10$...
  // await — бо хешування навмисно повільне (це його фіча, не баг).
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Зберігаємо ХЕШ, не пароль. Сам пароль ніде не осідає.
  // RETURNING віддає лише публічні поля — password_hash НЕ повертаємо.
  const result = await pool.query<PublicUser>(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, passwordHash],
  );

  const user = result.rows[0];

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" },
  );

  return { user, token }; // тепер повертаємо і юзера, і токен
}

export async function loginUser(
  email: string,
  password: string,
): Promise<string | null> {
  // Шукаємо користувача за email. Тут беремо ПОВНИЙ рядок (з хешем),
  // бо хеш потрібен для звірки — але назовні його не віддамо.
  const result = await pool.query<User>(
    "SELECT * FROM users WHERE email = $1",
    [email],
  );

  const user = result.rows[0];

  // Користувача з таким email нема → логін невдалий.
  if (!user) {
    return null;
  }

  // ── ЗВІРКА ПАРОЛЯ ──
  // bcrypt.compare бере введений пароль, хешує його ТАК САМО,
  // і порівнює з хешем із бази. true = пароль вірний.
  // Зверни увагу: ми НЕ "розшифровуємо" хеш (це неможливо) —
  // ми хешуємо введене й порівнюємо хеші.
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return null;
  }

  // ── ВИДАЧА JWT (браслета) ──
  // payload — що кладемо в токен. Тільки id! Ніякого пароля, нічого таємного.
  // Пам'ятаєш: payload читається всіма, тому туди лише ідентифікатор.
  const token = jwt.sign(
    { userId: user.id }, // payload
    process.env.JWT_SECRET as string, // секрет для підпису (з .env)
    { expiresIn: "1h" }, // токен живе 1 годину
  );

  return token;
}
