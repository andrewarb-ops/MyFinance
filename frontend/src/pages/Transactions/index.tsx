// frontend/src/pages/Transactions/index.tsx
import React, { useEffect, useState } from "react";
import { AddTransactionModal } from "./AddTransactionModal";
import {
  getTransactions,
  deleteTransaction,
  type Transaction,
} from "../../api/transactions";
import { getAccounts, type Account } from "../../api/accounts";
import { getCategories, type Category } from "../../api/categories";

const TransactionsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [items, setItems] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // для подтверждения удаления
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [deleteInput, setDeleteInput] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [txs, accs, cats] = await Promise.all([
        getTransactions(),
        getAccounts(),
        getCategories(),
      ]);
      setItems(txs);
      setAccounts(accs);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleTransactionSaved = () => {
    setEditTx(null);
    fetchAll();
  };

  const handleAddClick = () => {
    setEditTx(null);
    setIsModalOpen(true);
  };

  const requestDelete = (tx: Transaction) => {
    setDeletingTx(tx);
    setDeleteInput("");
  };

  const confirmDelete = async () => {
    if (!deletingTx) return;
    if (deleteInput.toLowerCase() !== "да") return;

    try {
      await deleteTransaction(deletingTx.id);
      setItems((prev) => prev.filter((t) => t.id !== deletingTx.id));
      closeDeleteModal();
    } catch (e) {
      console.error(e);
      closeDeleteModal();
    }
  };

  const closeDeleteModal = () => {
    setDeletingTx(null);
    setDeleteInput("");
  };

  const accountNameById = (id: number | null) =>
    accounts.find((a) => a.id === id)?.name || "Счет не найден";

  const categoryNameById = (id: number | null) =>
    categories.find((c) => c.id === id)?.name || "Без категории";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Транзакции</h1>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 rounded-lg bg-purple-500 text-white text-sm font-medium"
        >
          Добавить
        </button>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm p-4">
        {loading ? (
          <div className="text-gray-400 text-sm">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Здесь будет список операций
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((t) => {
              const sign = t.amount_minor < 0 ? "-" : "+";
              const amountAbs = Math.abs(t.amount_minor) / 100;

              return (
                <li
                  key={t.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-900">
                      {t.description || "Без описания"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(t.dt).toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {accountNameById(t.account_id)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Категория: {categoryNameById(t.category_id)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={`text-sm font-semibold ${
                        sign === "-" ? "text-red-500" : "text-green-500"
                      }`}
                    >
                      {sign}
                      {amountAbs.toFixed(2)} {t.currency}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditTx(t);
                        setIsModalOpen(true);
                      }}
                      className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500 hover:border-purple-400 hover:text-purple-600"
                    >
                      Редактировать
                    </button>

                    <button
                      type="button"
                      onClick={() => requestDelete(t)}
                      className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:border-red-400 hover:text-red-600"
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionSaved}
        initialTransaction={editTx}
      />

      {deletingTx && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Удаление транзакции
            </h3>
            <p className="text-gray-600 mb-4">
              Вы уверены, что хотите удалить транзакцию{" "}
              <b>{deletingTx.description || "Без описания"}</b> на сумму{" "}
              <b>
                {(Math.abs(deletingTx.amount_minor) / 100).toFixed(2)}{" "}
                {deletingTx.currency}
              </b>
              ?
              <br />
              <span className="text-sm mt-1 block">
                Введите слово{" "}
                <span className="font-bold text-black">да</span> для
                подтверждения.
              </span>
            </p>
            <input
              autoFocus
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Введите 'да'"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                onClick={closeDeleteModal}
              >
                Отмена
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                onClick={confirmDelete}
                disabled={deleteInput.toLowerCase() !== "да"}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
