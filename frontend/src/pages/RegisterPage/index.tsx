import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../api/api";
import { setToken } from "../../helpers/";

export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleRegister() {
    setError(null);

    // Проста клієнтська валідація — дублює серверну для швидкого фідбеку.
    if (!username || !email || !password) {
      setError("Заповніть усі поля");
      return;
    }
    if (password.length < 6) {
      setError("Пароль має бути не коротший за 6 символів");
      return;
    }

    try {
      const token = await register(username, email, password);
      setToken(token);

      // Після успіху ведемо на логін через 1.5с (щоб побачити повідомлення).
      navigate("/notes");
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div
      style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif" }}
    >
      <h1>Реєстрація</h1>

      <>
        <input
          placeholder="імʼя користувача"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleRegister}>Зареєструватись</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p style={{ marginTop: 16 }}>
          Вже є акаунт? <Link to="/login">Увійти</Link>
        </p>
      </>
    </div>
  );
}
