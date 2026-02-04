import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import type {DashboardTrendPoint} from "../../api/dashboard";

interface TrendChartProps {
    points: DashboardTrendPoint[];
}

const TrendChart: React.FC<TrendChartProps> = ({points}) => {
    if (!points.length) {
        return (
            <div className="text-sm text-gray-500">
                Нет данных для выбранного периода
            </div>
        );
    }

    // расходы в рублях
    const data = points.map((p) => ({
        label: p.label,
        expense: p.expense_minor / 100,
    }));

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{top: 10, right: 20, left: 0, bottom: 0}}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb"/>
                    <XAxis dataKey="label"/>
                    <YAxis/>
                    <Tooltip
                        formatter={(value: unknown) => {
                            const num = typeof value === "number" ? value : Number(value);
                            return `${num.toLocaleString("ru-RU", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })} ₽`;
                        }}
                        labelFormatter={(label: unknown) => `Дата: ${String(label)}`}
                    />
                    <Legend/>
                    <Bar
                        dataKey="expense"
                        name="Расходы"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export {TrendChart};
