// frontend/src/pages/Categories/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categories";
import type {
  Category,
  CategoryCreate,
  CategoryUpdate,
} from "../../api/categories";

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Для формы создания
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");

  // Для режима редактирования
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingType, setEditingType] = useState<"income" | "expense">("expense");

  // Для подтверждения удаления
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);
  const [deleteInput, setDeleteInput] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (e: any) {
        setError(e.message ?? "Ошибка загрузки категорий");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Сортировка
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.name.localeCompare(b.name);
    });
  }, [categories]);

  // Создание
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    const payload: CategoryCreate = {
      name: newName.trim(),
      type: newType,
    };
    try {
      const created = await createCategory(payload);
      setCategories((prev) => [...prev, created]);
      setNewName("");
    } catch (e: any) {
      setError(e.message ?? "Ошибка создания категории");
    }
  }

  // Редактирование
  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setEditingType(cat.type);
  }

  async function saveEdit(cat: Category) {
    const payload: CategoryUpdate = {
      name: editingName.trim() || cat.name,
      type: editingType,
    };
    try {
      const updated = await updateCategory(cat.id, payload);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? updated : c))
      );
      setEditingId(null);
      setEditingName("");
      setEditingType("expense");
    } catch (e: any) {
      setError(e.message ?? "Ошибка обновления категории");
    }
  }

  // Архивация
  function requestDelete(cat: Category) {
    setDeletingCat(cat);
    setDeleteInput("");
  }

  async function confirmDelete() {
    if (!deletingCat) return;
    if (deleteInput.toLowerCase() !== "да") return;

    try {
      await deleteCategory(deletingCat.id);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === deletingCat.id ? { ...c, is_active: false } : c
        )
      );
      closeDeleteModal();
    } catch (e: any) {
      setError(e.message ?? "Ошибка удаления категории");
      closeDeleteModal();
    }
  }

  function closeDeleteModal() {
    setDeletingCat(null);
    setDeleteInput("");
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Категории</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Карточка добавления */}
      <div className="bg-white shadow rounded-lg p-4">
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Например, Продукты"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Тип
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newType}
              onChange={(e) =>
                setNewType(e.target.value as "income" | "expense")
              }
            >
              <option value="expense">Расход</option>
              <option value="income">Доход</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            Добавить
          </button>
        </form>
      </div>

      {/* Таблица в карточке */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        {loading && <div className="p-4 text-center text-gray-500">Загрузка…</div>}

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Активна
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedCategories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {editingId === c.id ? (
                    <input
                      className="border border-gray-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                  ) : (
                    <span className="font-medium">{c.name}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingId === c.id ? (
                    <select
                      className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      value={editingType}
                      onChange={(e) =>
                        setEditingType(e.target.value as "income" | "expense")
                      }
                    >
                      <option value="expense">Расход</option>
                      <option value="income">Доход</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.type === "income"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {c.type === "income" ? "Доход" : "Расход"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {c.is_active ? (
                    <span className="text-green-600 font-medium">Да</span>
                  ) : (
                    <span className="text-gray-400">Нет</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                  {editingId === c.id ? (
                    <>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => saveEdit(c)}
                      >
                        Сохранить
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                      >
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={() => startEdit(c)}
                      >
                        Править
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => requestDelete(c)}
                        disabled={!c.is_active}
                      >
                        Архив
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {sortedCategories.length === 0 && !loading && (
              <tr>
                <td className="px-6 py-10 text-center text-gray-500" colSpan={4}>
                  Список пуст. Добавьте первую категорию!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно */}
      {deletingCat && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Архивация категории
            </h3>
            <p className="text-gray-600 mb-4">
              Вы уверены, что хотите переместить <b>{deletingCat.name}</b> в архив?
              <br />
              <span className="text-sm mt-1 block">
                Введите слово <span className="font-bold text-black">да</span> для подтверждения.
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
                Архивировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
