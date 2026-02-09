import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../api/auth";

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await register({ username, password });
      setSuccess("Аккаунт создан. Теперь можно войти.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось зарегистрироваться");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">Регистрация</h1>
        <p className="text-sm text-slate-500 mb-6">
          Создайте новый аккаунт, чтобы начать учитывать финансы.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-600">Логин</label>
            <input
<<<<<<< codex/review-project-without-changes-7kx3vc
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
=======
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
>>>>>>> master
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Пароль</label>
            <input
<<<<<<< codex/review-project-without-changes-7kx3vc
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
=======
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
>>>>>>> master
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2">
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 text-white py-2 text-sm font-semibold hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Создаем..." : "Создать аккаунт"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-xs text-slate-500 hover:text-slate-700"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;
