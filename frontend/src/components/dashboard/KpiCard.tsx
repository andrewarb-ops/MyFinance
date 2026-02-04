import React from "react";

export interface KpiCardProps {
  title: string;
  value: string;
  accent?: "default" | "positive" | "negative";
}

const accentClasses: { [key in NonNullable<KpiCardProps["accent"]>]: string } = {
  default: "",
  positive: "text-emerald-600",
  negative: "text-red-600",
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  accent = "default",
}) => {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className={`text-lg font-semibold ${accentClasses[accent]}`}>
        {value}
      </div>
    </div>
  );
};
