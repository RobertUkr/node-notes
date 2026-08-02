import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./helpers";
import { LoginPage } from "./pages/LoginPage";
import { NotesPage } from "./pages/NotesPage";
import { RegisterPage } from "./pages/RegisterPage";

// ── ЗАХИЩЕНИЙ МАРШРУТ ──
// Обгортка: якщо токена нема — редірект на /login.
// Якщо є — показуємо вкладений вміст (children).
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />; // редірект
  }
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Нотатки — тільки для залогінених */}
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />

        {/* Корінь — редірект на нотатки (звідти на логін, якщо нема токена) */}
        <Route path="/" element={<Navigate to="/notes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
