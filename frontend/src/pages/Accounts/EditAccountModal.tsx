import React, { useEffect, useState } from "react";

import type { Account, AccountUpdate } from "../../api/accounts";
import { updateAccount } from "../../api/accounts";

interface Props {
  account: Account | null;
  isOpen: boolean;
  onSaved: (acc: Account) => void;
  onClose: () => void;
}

const EditAccountModal: React.FC<Props> = ({
  account,
  isOpen,
  onSaved,
  onClose,
}) => {
  const [form, setForm] = useState({
    name: "",
    type: "card",
    currency: "RUB",
    card_number: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && account) {
      setForm({
        name: account.name,
        type: account.type,
        currency: account.currency,
        card_number: account.card_number ?? "",
        is_active: account.is_active,
      });
    }
  }, [isOpen, account]);

  if (!isOpen || !account) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setLoading(true);
    setError(null);

    try {
      const payload: AccountUpdate = {
        name: form.name.trim(),
        type: form.type,
        currency: form.currency,
        card_number: form.card_number.trim() || null,
        is_active: form.is_active,
      };

      const updated = (await updateAccount(account.id, payload)) as Account;
      onSaved(updated);
      onClose();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Редактировать счёт</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Название</label>
            <input
              name="name"
              type="text"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Тип счёта</label>
            <select
              name="type"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.type}
              onChange={handleChange}
            >
              <option value="card">Банковская карта</option>
              <option value="cash">Наличные</option>
              <option value="brokerage">Брокерский счёт</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Валюта</label>
            <select
              name="currency"
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.currency}
              onChange={handleChange}
            >
              <option value="RUB">RUB</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Последние 4 цифры карты
            </label>
            <input
              name="card_number"
              type="text"
              maxLength={4}
              className="w-full rounded border px-3 py-2 text-sm"
              value={form.card_number}
              onChange={handleChange}
              placeholder="1234"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is_active"
              name="is_active"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              checked={form.is_active}
              onChange={handleChange}
            />
            <label
              htmlFor="is_active"
              className="text-sm text-slate-700 select-none"
            >
              Активен
            </label>
          </div>

          {error && (
            <div className="rounded bg-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded border px-4 py-2 text-sm"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Сохраняю..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccountModal;
