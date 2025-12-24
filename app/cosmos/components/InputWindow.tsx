"use client";

import React from "react";

type InputWindowVariant = "glass" | "nebula";
type InputWindowSize = "sm" | "md";
type InputWindowRadius = "md" | "lg";

interface InputWindowProps {
  children: React.ReactNode;
  className?: string;
  variant?: InputWindowVariant;
  size?: InputWindowSize;
  radius?: InputWindowRadius;
  showAccent?: boolean;
  accentClassName?: string;
}

const baseClasses = "relative border overflow-hidden";

const variantClasses: Record<InputWindowVariant, string> = {
  glass: "border-white/15 bg-white/10 shadow-2xl backdrop-blur-lg",
  nebula: "border-slate-800 bg-gradient-to-br from-slate-950/70 via-slate-900/60 to-indigo-950/40 shadow-xl shadow-indigo-900/20",
};

const sizeClasses: Record<InputWindowSize, string> = {
  sm: "p-5",
  md: "p-6 sm:p-8",
};

const radiusClasses: Record<InputWindowRadius, string> = {
  md: "rounded-2xl",
  lg: "rounded-3xl",
};

const InputWindow: React.FC<InputWindowProps> = ({
  children,
  className = "",
  variant = "glass",
  size = "md",
  radius = "md",
  showAccent = false,
  accentClassName = "bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-400/10",
}) => {
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${radiusClasses[radius]} ${className}`}
    >
      {showAccent && (
        <div className={`pointer-events-none absolute inset-0 ${accentClassName}`} />
      )}
      {children}
    </div>
  );
};

export default InputWindow;
