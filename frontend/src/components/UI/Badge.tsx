import React from 'react';

type VariantType = "success" | "warning" | "danger" | "info" | "orange" | "neutral" | "dark";

export const getStatusVariant = (status: string): VariantType => {
  const s = status.toUpperCase();
  if (["ACTIVE", "CONFIRMED", "APPROVED", "PRESENT", "ISSUED"].includes(s)) return "success";
  if (["PENDING", "DUE_SOON", "PROCESSING"].includes(s)) return "warning";
  if (["EXPIRED", "REJECTED", "ABSENT", "INACTIVE"].includes(s)) return "danger";
  return "neutral";
};

export const Badge: React.FC<{ variant: VariantType; children: React.ReactNode; size?: "sm" | "md" | "lg" }> = ({ variant, children, size = "md" }) => {
  const colorMap: Record<VariantType, string> = {
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
    neutral: "bg-slate-100 text-slate-600",
    dark: "bg-slate-800 text-white"
  };

  const dotMap: Record<VariantType, string> = {
    success: "bg-green-500",
    warning: "bg-amber-500",
    danger: "bg-red-500",
    info: "bg-blue-500",
    orange: "bg-orange-500",
    neutral: "bg-slate-400",
    dark: "bg-white"
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full font-dm ${colorMap[variant]} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[variant]}`}></span>
      {children}
    </span>
  );
};
