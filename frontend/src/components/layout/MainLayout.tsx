import React from "react";
import { Link, useLocation } from "react-router-dom";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Общая информация" },
    { to: "/accounts", label: "Счета и кошельки" },
    { to: "/categories", label: "Категории затрат" },
    { to: "/transactions", label: "Транзакции" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        {/* Левый сайдбар */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-violet-500 bg-gradient-to-tr from-violet-500 to-fuchsia-500 shadow-md" />
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Шекели, мои шекели
              </div>
              <div className="text-xs text-slate-400">
                Личный финансовый трекер
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors " +
                    (isActive
                      ? "bg-violet-50 text-violet-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                  }
                >
                  {/* Простая псевдо-иконка, потом заменим на настоящие svg */}
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="px-4 pb-4">
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-rose-50 border border-amber-100 p-4 text-xs text-slate-600 shadow-sm">
              <div className="mb-2 font-semibold text-slate-800">
                Нужна помощь?
              </div>
              <p className="mb-3">
                Если что-то сломалось или хочется фичу — напиши себе в TODO.
              </p>
              <button className="w-full rounded-xl bg-white text-slate-700 border border-slate-200 py-1.5 text-xs font-medium hover:bg-slate-50">
                Открыть центр помощи
              </button>
            </div>
          </div>
        </aside>

        {/* Правая часть: верхний бар + контент */}
        <div className="flex-1 flex flex-col">
          {/* Верхний бар внутри контента */}
          <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 bg-slate-50/80 backdrop-blur">
            <div className="text-sm text-slate-500">
              Добро пожаловать обратно
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-400 shadow-sm min-w-[220px]">
                <span className="mr-2">🔎</span>
                <span>Поиск по транзакциям...</span>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-semibold shadow-md">
                Я
              </div>
            </div>
          </header>

          {/* Основной контент страниц */}
          <main className="flex-1 px-8 py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
