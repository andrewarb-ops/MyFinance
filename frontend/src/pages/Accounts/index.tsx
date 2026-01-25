import React, { useEffect, useState } from "react";
import { getAccounts } from "../../api/accounts";
import type { Account } from "../../api/accounts";

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAccounts()
      .then(setAccounts)
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Unknown error");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-slate-500 text-sm">
        Загружаю счета...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        Ошибка: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Мои счета
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Управляй своими кошельками, картами и брокерскими счетами.
          </p>
        </div>
        <button className="rounded-xl bg-violet-600 text-white text-sm font-medium px-4 py-2 shadow-sm hover:bg-violet-700">
          + Новый счёт
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          У тебя пока нет ни одного счёта. Нажми «Новый счёт», чтобы добавить
          первый кошелёк или карту.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              {/* Лёгкий фон-градиент в верхней части карточки */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50 opacity-70" />
              <div className="relative p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {acc.type === "card"
                      ? "Банковская карта"
                      : acc.type === "cash"
                      ? "Наличные"
                      : acc.type}
                  </span>
                  <span className="text-xs rounded-full px-2 py-0.5 bg-slate-900/80 text-slate-50">
                    #{acc.id}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-base font-semibold text-slate-900">
                    {acc.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Валюта: {acc.currency}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <div className="text-xs text-slate-500">
                    Статус:
                    <span
                      className={
                        "ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium " +
                        (acc.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700")
                      }
                    >
                      {acc.is_active ? "Активен" : "Неактивен"}
                    </span>
                  </div>
                  <button className="text-[11px] font-medium text-violet-600 hover:text-violet-700">
                    Детали
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
