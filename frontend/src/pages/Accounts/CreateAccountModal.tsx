import React, { useState } from "react";
import type { AccountCreate, Account } from "../../api/accounts";
import { createAccount } from "../../api/accounts";

interface Props {
  onCreated: (acc: Account) => void;
  onClose: () => void;
}

const CreateAccountModal: React.FC<Props> = ({ onCreated, onClose }) => {
  const [form, setForm] = useState<AccountCreate>({
    name: "",
    type: "card",
    currency: "RUB",
    card_number: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: AccountCreate = {
        name: form.name.trim(),
        type: form.type,
        currency: form.currency,
        card_number: form.card_number?.trim() || null,
      };

      const created = (await createAccount(payload)) as Account;
      onCreated(created);
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Новый счёт</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm rounded-lg border"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Сохраняю..." : "Создать счёт"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccountModal;
