import React, { useEffect, useState } from "react";

import type { Account } from "../../api/accounts";
import type { Category } from "../../api/categories";
import type { Transaction } from "../../api/transactions";

import { getAccounts } from "../../api/accounts";
import { getCategories } from "../../api/categories";
import {
  createTransaction,
  updateTransaction,
} from "../../api/transactions";

type TransactionType = "expense" | "income" | "transfer";

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialTransaction,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState("");

  const [selectedAccountFrom, setSelectedAccountFrom] =
    useState<number | null>(null);
  const [selectedAccountTo, setSelectedAccountTo] =
    useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<number | null>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // загрузка счетов/категорий и проставление значений при открытии
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const accs = await getAccounts();
        setAccounts(accs);

        if (initialTransaction) {
          // режим редактирования
          setType(initialTransaction.kind);
          setAmount(
            (Math.abs(initialTransaction.amount_minor) / 100).toString()
          );
          setDescription(initialTransaction.description ?? "");
          setSelectedAccountFrom(initialTransaction.account_id);
          setSelectedAccountTo(initialTransaction.account_id);
          setSelectedCategory(initialTransaction.category_id);
        } else {
          // режим создания
          setType("expense");
          setAmount("");
          setDescription("");
          if (accs.length) {
            setSelectedAccountFrom(accs[0].id);
            setSelectedAccountTo(accs[0].id);
          }
          setSelectedCategory(null);
        }

        const categoryType: "income" | "expense" =
          (initialTransaction?.kind ?? "expense") === "income"
            ? "income"
            : "expense";

        const cats = await getCategories({ type: categoryType });
        setCategories(cats);
        if (!initialTransaction && cats.length) {
          setSelectedCategory(cats[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isOpen, initialTransaction]);

  const typeColors: Record<TransactionType, string> = {
    expense: "bg-red-500 hover:bg-red-600",
    income: "bg-green-500 hover:bg-green-600",
    transfer: "bg-blue-500 hover:bg-blue-600",
  };

  const activeTabClass = (t: TransactionType) =>
    type === t
      ? `flex-1 py-2 text-sm font-medium rounded-md shadow-sm transition-all ${
          t === "expense"
            ? "bg-red-100 text-red-700"
            : t === "income"
            ? "bg-green-100 text-green-700"
            : "bg-blue-100 text-blue-700"
        }`
      : "flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const parsedAmount = Number(amount.replace(",", "."));
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    const amountMinor = Math.round(parsedAmount * 100);

    let accountId: number | null = null;
    if (type === "expense" || type === "transfer") {
      accountId = selectedAccountFrom;
    } else {
      accountId = selectedAccountTo;
    }
    if (!accountId) return;

    const account = accounts.find((a) => a.id === accountId);
    const currency = account?.currency ?? "RUB";

    try {
      setLoading(true);

      if (initialTransaction) {
        // редактирование: пока меняем только категорию и комментарий
        await updateTransaction(initialTransaction.id, {
          category_id: selectedCategory ?? undefined,
          description: description || undefined,
        });
      } else {
        // создание новой
        if (type === "transfer") {
          console.warn("Transfer is not implemented yet");
        } else {
          await createTransaction({
            account_id: accountId,
            category_id: selectedCategory,
            amount_minor: amountMinor, // всегда > 0
            currency,
            dt: new Date().toISOString(),
            description: description || undefined,
            kind: type, // "income" | "expense"
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const title = initialTransaction ? "Редактировать операцию" : "Новая операция";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={activeTabClass("expense")}
            >
              Расход
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={activeTabClass("income")}
            >
              Доход
            </button>
            <button
              type="button"
              onClick={() => setType("transfer")}
              className={activeTabClass("transfer")}
            >
              Перевод
            </button>
          </div>

          <div className="relative text-center">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              autoFocus
              className={`w-full text-center text-4xl font-bold bg-transparent border-b-2 border-transparent focus:border-gray-300 focus:outline-none placeholder-gray-300 py-2 ${
                type === "expense"
                  ? "text-gray-900"
                  : type === "income"
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            />
            <span className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 font-medium text-xl">
              ₽
            </span>
          </div>

          <div className="space-y-4">
            {(type === "expense" || type === "transfer") && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  С карты / счета
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow appearance-none"
                  value={selectedAccountFrom ?? ""}
                  onChange={(e) =>
                    setSelectedAccountFrom(Number(e.target.value))
                  }
                >
                  <option value="">Выберите счет...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currency})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(type === "income" || type === "transfer") && (
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  На счет
                </label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow appearance-none"
                  value={selectedAccountTo ?? ""}
                  onChange={(e) =>
                    setSelectedAccountTo(Number(e.target.value))
                  }
                >
                  <option value="">Выберите счет...</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {type !== "transfer" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Категория
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="p-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                >
                  🍔 Продукты
                </button>
                <button
                  type="button"
                  className="p-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-colors"
                >
                  🚕 Транспорт
                </button>
              </div>
              <select
                className="mt-2 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                value={selectedCategory ?? ""}
                onChange={(e) => setSelectedCategory(Number(e.target.value))}
              >
                <option value="">Все категории...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <input
            type="text"
            placeholder="Комментарий..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm text-gray-600 placeholder-gray-400 border-none border-b border-gray-200 focus:border-purple-500 focus:ring-0 px-0 py-2 bg-transparent transition-colors"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-semibold shadow-lg active:scale-[0.98] transition-all ${typeColors[type]}`}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
        </form>
      </div>
    </div>
  );
};
