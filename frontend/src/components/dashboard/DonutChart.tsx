import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardCategories } from "../../api/dashboard";

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#a855f7"];

interface DonutChartProps {
  data: DashboardCategories;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  if (!data.categories.length) {
    return (
      <div className="text-sm text-gray-500">
        Нет данных по категориям
      </div>
    );
  }

  const chartData = data.categories.map((c, idx) => ({
    name: c.name,
    value: c.amount_minor / 100,
    color: COLORS[idx % COLORS.length],
  }));

  const totalMinor = Number.isFinite(data.total_amount_minor)
    ? data.total_amount_minor
    : 0;

  const totalRub = totalMinor / 100;
  const totalText = Number.isFinite(totalRub)
    ? totalRub.toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0,00";

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>

          {/* Сумма в центре бублика */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-red-600 font-semibold"
            style={{ fontSize: 16 }}
          >
            {totalText} ₽
          </text>

          <Tooltip
            formatter={(value: unknown) => {
              const num =
                typeof value === "number" ? value : Number(value ?? 0);
              const safe = Number.isFinite(num) ? num : 0;
              return `${safe.toLocaleString("ru-RU", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ₽`;
            }}
            labelFormatter={(label: unknown) =>
              `Категория: ${String(label)}`
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
