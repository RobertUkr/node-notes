import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Розширюємо тип Request, щоб додати поле userId.
// TS інакше не дасть писати req.userId — він не знає про таке поле.
// Так ми легально "домальовуємо" Express-запиту наше поле.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // 1. Дістаємо заголовок Authorization.
  const authHeader = req.headers.authorization;

  // Очікуємо формат "Bearer <токен>". Нема заголовка → 401.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res
      .status(401)
      .json({ error: "Your request was made with invalid credentials." });
    return;
  }

  // 2. Відрізаємо "Bearer " і лишаємо сам токен.
  const token = authHeader.split(" ")[1];

  try {
    // 3. Перевіряємо підпис. jwt.verify або поверне payload, або КИНЕ помилку
    //    (якщо токен протух / підроблений / кривий).
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
    };

    // 4. Кладемо id користувача в req — щоб роут далі знав, ХТО це.
    req.userId = payload.userId;

    // 5. next() = "воротар пропускає далі". Без нього запит зависне!
    next();
  } catch (err) {
    // verify кинув помилку → токен невалідний.
    res
      .status(401)
      .json({ error: "Your request was made with invalid credentials." });
  }
}
