import React from "react";

const ArrowIcon: React.FC<{ direction: "left" | "right" }> = ({ direction }) => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    className="h-5 w-5 stroke-[2.5] drop-shadow-[0_0_6px_rgba(56,189,248,0.45)]"
  >
    <path
      d={
        direction === "left"
          ? "M14.5 5.5 8 12l6.5 6.5"
          : "M9.5 5.5 16 12l-6.5 6.5"
      }
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type ArrowButtonProps = {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
  label: string;
};

const ArrowButton: React.FC<ArrowButtonProps> = ({ direction, disabled, onClick, label }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className="absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/85 text-slate-50 shadow-[0_10px_30px_rgba(8,47,73,0.55)] backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-sky-300/60 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-40"
    style={{ [direction === "left" ? "left" : "right"]: "8px" }}
  >
    <ArrowIcon direction={direction} />
  </button>
);

export default ArrowButton;
