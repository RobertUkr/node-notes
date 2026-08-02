import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/api";
import { setToken } from "../../helpers";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // програмний перехід між маршрутами

  async function handleLogin() {
    setError(null);
    try {
      const token = await login(email, password);
      setToken(token);
      navigate("/notes"); // після входу — на сторінку нотаток
    } catch {
      setError("Невірний email або пароль");
    }
  }

  return (
    <div
      style={{ maxWidth: 400, margin: "60px auto", fontFamily: "sans-serif" }}
    >
      <h1>Вхід</h1>
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
      <button onClick={handleLogin}>Увійти</button>
      <p style={{ marginTop: 16 }}>
        Немає акаунту? <Link to="/register">Зареєструватись</Link>
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
