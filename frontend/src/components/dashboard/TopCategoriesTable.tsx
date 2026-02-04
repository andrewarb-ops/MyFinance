import React from "react";
import type { DashboardCategories } from "../../api/dashboard";

interface TopCategoriesTableProps {
  data: DashboardCategories;
  formatMoney: (minor: number, currency: string) => string;
}

export const TopCategoriesTable: React.FC<TopCategoriesTableProps> = ({
  data,
  formatMoney,
}) => {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <h2 className="font-semibold mb-2 text-sm">Расходы по категориям</h2>
      <div className="text-sm mb-2">
        Всего расходов: {formatMoney(data.total_expense_minor, data.currency)}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-2">Категория</th>
              <th className="text-right py-1 pr-2">Сумма</th>
              <th className="text-right py-1">Доля, %</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((c) => (
              <tr key={c.category_id} className="border-b last:border-0">
                <td className="py-1 pr-2">{c.name}</td>
                <td className="py-1 pr-2 text-right">
                  {formatMoney(c.amount_minor, data.currency)}
                </td>
                <td className="py-1 text-right">
                  {(c.share * 100).toFixed(1)}
                </td>
              </tr>
            ))}
            {data.categories.length === 0 && (
              <tr>
                <td colSpan={3} className="py-2 text-center text-gray-500">
                  Нет расходов за выбранный период
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
