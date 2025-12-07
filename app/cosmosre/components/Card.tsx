"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  className = "",
  children,
  interactive = false,
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <motion.div
      onClick={handleClick}
      className={[
        "rounded-3xl bg-white/10 p-6 backdrop-blur-lg border border-white/20 shadow-[0_0_40px_rgba(148,163,184,0.45)]",
        interactive && "cursor-pointer",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      initial={{ opacity: 0.8, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.96 } : undefined}
    >
      {children}
    </motion.div>
  );
};
