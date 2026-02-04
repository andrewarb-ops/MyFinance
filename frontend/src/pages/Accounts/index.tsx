import React, {useEffect, useState} from "react";
import MirLogo from "../../assets/Mir-logo.SVG.svg";
import {
    getAccounts,
    deleteAccount,
    getAccountBalance,
} from "../../api/accounts";
import type {Account, AccountBalance} from "../../api/accounts";

import CreateAccountModal from "./CreateAccountModal";
import EditAccountModal from "./EditAccountModal";

const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [balances, setBalances] = useState<Record<number, AccountBalance>>({});
    const [loading, setLoading] = useState(true);
    const [balancesLoading, setBalancesLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);

    // загрузка счетов
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

    // загрузка балансов после получения счетов
    useEffect(() => {
        if (!accounts.length) return;

        setBalancesLoading(true);
        (async () => {
            try {
                const results = await Promise.all(
                    accounts.map((acc) => getAccountBalance(acc.id))
                );
                const map: Record<number, AccountBalance> = {};
                for (const b of results) {
                    map[b.account_id] = b;
                }
                setBalances(map);
            } catch (e) {
                console.error("Failed to load balances", e);
            } finally {
                setBalancesLoading(false);
            }
        })();
    }, [accounts]);

    const handleCreated = (acc: Account) => {
        setAccounts((prev) => [...prev, acc]);
    };

    const handleUpdated = (acc: Account) => {
        setAccounts((prev) => prev.map((a) => (a.id === acc.id ? acc : a)));
    };

    const openEdit = (acc: Account) => {
        setAccountToEdit(acc);
        setIsEditOpen(true);
    };

    const handleDelete = async (acc: Account) => {
        const answer = window.prompt(
            `Если хотите удалить счёт "${acc.name}", напишите "да":`,
            ""
        );

        if (answer?.toLowerCase().trim() !== "да") {
            return;
        }

        try {
            await deleteAccount(acc.id);
            setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
        } catch (e: unknown) {
            if (e instanceof Error) {
                alert(`Не удалось удалить счёт: ${e.message}`);
            } else {
                alert("Не удалось удалить счёт (Unknown error)");
            }
        }
    };

    const formatMoney = (minor: number, currency: string) => {
        return `${(minor / 100).toFixed(2)} ${currency}`;
    };

    if (loading) {
        return (
            <div className="p-6 text-sm text-slate-600">Загружаю счета...</div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-sm text-red-700">
                Ошибка: {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Мои счета
                    </h1>
                    <p className="text-sm text-slate-500">
                        Управляй своими кошельками, картами и брокерскими счетами.
                    </p>
                </div>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
                >
                    + Новый счёт
                </button>
            </div>

            {accounts.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-6 text-sm text-slate-600">
                    У тебя пока нет ни одного счёта. Нажми «Новый счёт», чтобы добавить
                    первый кошелёк или карту.
                </div>
            ) : (
                <div className="space-y-3">
                    {accounts.map((acc) => {
                        const balance = balances[acc.id];
                        const balanceText =
                            balance && !balancesLoading
                                ? formatMoney(balance.balance_minor, balance.currency)
                                : balancesLoading
                                    ? "Загружаю баланс..."
                                    : "—";

                        return (
                            <div
                                key={acc.id}
                                className={
                                    "flex items-center justify-between rounded-xl p-4 shadow-sm " +
                                    (acc.is_active ? "bg-white" : "bg-slate-100 opacity-70")
                                }
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex h-10 w-10 items-center justify-center">
                                        {acc.type === "cash" ? (
                                            <span className="text-lg">₽</span>
                                        ) : (
                                            <img
                                                src={MirLogo}
                                                alt="Мир"
                                                className="h-6 w-auto"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">
                                            {acc.type === "card"
                                                ? "Банковская карта"
                                                : acc.type === "cash"
                                                    ? "Наличные"
                                                    : acc.type}
                                        </div>
                                        <div className="text-sm font-medium text-slate-900">
                                            {acc.name}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {acc.card_number && (
                                                <span className="mr-2">
                          **** {acc.card_number}
                        </span>
                                            )}
                                            Валюта: {acc.currency}
                                        </div>
                                        <div className="mt-1 text-sm text-emerald-600">
                                            Баланс:{" "}
                                            <span className="text-base italic font-semibold text-emerald-600">
                                               {balanceText}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                  <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                          acc.is_active
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                      }`}
                  >
                    {acc.is_active ? "Активен" : "Неактивен"}
                  </span>

                                    <button
                                        onClick={() => openEdit(acc)}
                                        className="text-xs font-medium text-violet-600 hover:text-violet-500"
                                    >
                                        Редактировать
                                    </button>

                                    <button
                                        onClick={() => handleDelete(acc)}
                                        className="text-xs font-medium text-red-600 hover:text-red-500"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isCreateOpen && (
                <CreateAccountModal
                    onCreated={handleCreated}
                    onClose={() => setIsCreateOpen(false)}
                />
            )}

            {isEditOpen && accountToEdit && (
                <EditAccountModal
                    account={accountToEdit}
                    isOpen={isEditOpen}
                    onSaved={handleUpdated}
                    onClose={() => {
                        setIsEditOpen(false);
                        setAccountToEdit(null);
                    }}
                />
            )}
        </div>
    );
};

export default AccountsPage;
