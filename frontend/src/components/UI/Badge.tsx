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
    success: "bg-green-50 text-green-700 ring-green-600/20",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
    danger: "bg-red-50 text-red-700 ring-red-600/20",
    info: "bg-blue-50 text-blue-700 ring-blue-600/20",
    orange: "bg-orange-50 text-orange-700 ring-orange-600/20",
    neutral: "bg-slate-50 text-slate-600 ring-slate-500/20",
    dark: "bg-slate-800 text-white ring-slate-700/20"
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
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset ${colorMap[variant]} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[variant]}`}></span>
      {children}
    </span>
  );
};
