import React, { useEffect, useState } from "react";
import { TopCategoriesTable } from "../../components/dashboard/TopCategoriesTable";
import {
  getDashboardSummary,
  getDashboardTrends,
  getDashboardCategories,
} from "../../api/dashboard";
import { DonutChart } from "../../components/dashboard/DonutChart";

import { TrendChart } from "../../components/dashboard/TrendChart";
import type {
  DashboardSummary,
  DashboardTrends,
  DashboardCategories,
  PeriodType,
} from "../../api/dashboard";
import { KpiCard } from "../../components/dashboard/KpiCard";

const DEFAULT_PERIOD: PeriodType = "month";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(minor: number, currency: string): string {
  const value = minor / 100;
  return `${value.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<PeriodType>(DEFAULT_PERIOD);
  const [baseDate, setBaseDate] = useState<string>(todayIso());

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [categories, setCategories] = useState<DashboardCategories | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [s, t, c] = await Promise.all([
          getDashboardSummary(period, baseDate),
          getDashboardTrends(period, baseDate),
          getDashboardCategories(period, baseDate, 5),
        ]);

        if (cancelled) return;
        setSummary(s);
        setTrends(t);
        setCategories(c);
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [period, baseDate]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold mb-2">Дашборд</h1>

      {/* Панель выбора периода и даты */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span>Период:</span>
        <select
          className="border rounded px-2 py-1"
          value={period}
          onChange={(e) => setPeriod(e.target.value as PeriodType)}
        >
          <option value="day">День</option>
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="quarter">Квартал</option>
          <option value="year">Год</option>
        </select>

        <span className="ml-4">Базовая дата:</span>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={baseDate}
          onChange={(e) => setBaseDate(e.target.value)}
        />
      </div>

      {loading && <div>Загрузка метрик...</div>}
      {error && <div className="text-red-600">Ошибка: {error}</div>}

      {/* KPI карточки */}
      {summary && (
        <div className="space-y-2">
          <div className="text-sm text-gray-500">
            Даты: {summary.date_from} — {summary.date_to}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <KpiCard
              title="Чистый поток"
              value={formatMoney(summary.net_flow_minor, summary.currency)}
            />
            <KpiCard
              title="Доходы"
              value={formatMoney(summary.income_minor, summary.currency)}
              accent="positive"
            />
            <KpiCard
              title="Расходы"
              value={formatMoney(summary.expense_minor, summary.currency)}
              accent="negative"
            />
            <KpiCard
              title="Баланс счетов"
              value={formatMoney(
                summary.accounts_balance_minor,
                summary.currency
              )}
            />
          </div>
        </div>
      )}

      {/* Средняя секция: слева тренды, справа категории */}
     {/* Средняя секция: слева столбцы, справа бублик */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {trends && (
          <div className="bg-white border rounded-lg p-3 shadow-sm">
            <h2 className="font-semibold mb-2 text-sm">
              Динамика расходов
            </h2>
            <TrendChart points={trends.points} />
          </div>
        )}

        {categories && (
          <div className="bg-white border rounded-lg p-3 shadow-sm">
            <h2 className="font-semibold mb-2 text-sm">
              Расходы по категориям
            </h2>
            <DonutChart data={categories} />
          </div>
        )}
      </div>

      {/* Таблица категорий ниже */}
      {categories && (
        <TopCategoriesTable data={categories} formatMoney={formatMoney} />
      )}
    </div>
  );
};

export default DashboardPage;
