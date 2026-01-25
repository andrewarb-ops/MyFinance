import React, { useEffect, useState } from "react";

import { getAccounts, createAccount } from "../../api/accounts";
import type { Account, AccountCreate } from "../../api/accounts";

const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<AccountCreate>({
    name: "",
    type: "card",
    currency: "RUB",
    card_number: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAccounts()
      .then((data) => setAccounts(data as Account[]))
      .catch((e: unknown) => {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Unknown error");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleOpenCreate = () => {
    setForm({
      name: "",
      type: "card",
      currency: "RUB",
      card_number: "",
    });
    setCreateError(null);
    setIsCreateOpen(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      const payload: AccountCreate = {
        name: form.name.trim(),
        type: form.type,
        currency: form.currency,
        card_number: form.card_number?.trim() || null,
      };

      const created = (await createAccount(payload)) as Account;
      setAccounts((prev) => [...prev, created]);
      setIsCreateOpen(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setCreateError(e.message);
      } else {
        setCreateError("Unknown error");
      }
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Загружаю счета...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Ошибка: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Мои счета</h1>
          <p className="text-sm text-slate-500">
            Управляй своими кошельками, картами и брокерскими счетами.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-500"
        >
          + Новый счёт
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-sm text-slate-500">
          У тебя пока нет ни одного счёта. Нажми «Новый счёт», чтобы добавить
          первый кошелёк или карту.
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-xl"
            >
              <div className="h-1.5 bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400" />

              <div className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold">
                    {acc.type === "cash" ? "₽" : "МИР"}
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      {acc.type === "card"
                        ? "Банковская карта"
                        : acc.type === "cash"
                        ? "Наличные"
                        : acc.type}
                    </div>
                    <div className="font-medium">{acc.name}</div>
                    {acc.card_number && (
                      <div className="text-xs text-slate-500 mt-1">
                        **** {acc.card_number}
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2">
                      Валюта: {acc.currency}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      acc.is_active
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {acc.is_active ? "Активен" : "Неактивен"}
                  </span>
                  <button className="text-xs text-violet-500 hover:text-violet-600">
                    Детали
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Новый счёт</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Название</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Карта Т-Банка Андрей"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Тип счёта</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="card">Банковская карта</option>
                  <option value="cash">Наличные</option>
                  <option value="brokerage">Брокерский счёт</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Валюта</label>
                <select
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="RUB">RUB</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Последние 4 цифры карты
                </label>
                <input
                  name="card_number"
                  value={form.card_number ?? ""}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="6120"
                  maxLength={4}
                />
              </div>

              {createError && (
                <div className="text-sm text-red-600">{createError}</div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-2 text-sm rounded-lg border"
                  disabled={createLoading}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60"
                  disabled={createLoading}
                >
                  {createLoading ? "Сохраняю..." : "Создать счёт"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;
