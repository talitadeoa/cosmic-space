"use client";

export type MoonPhase = "luaNova" | "luaCrescente" | "luaCheia" | "luaMinguante";

export const MOON_PHASES: MoonPhase[] = [
  "luaNova",
  "luaCrescente",
  "luaCheia",
  "luaMinguante",
];

export const MOON_PHASE_LABELS: Record<MoonPhase, string> = {
  luaNova: "Lua Nova",
  luaCrescente: "Lua Crescente",
  luaCheia: "Lua Cheia",
  luaMinguante: "Lua Minguante",
};

export const MOON_PHASE_EMOJI_LABELS: Record<MoonPhase, string> = {
  luaNova: "🌑 Lua Nova",
  luaCrescente: "🌓 Lua Crescente",
  luaCheia: "🌕 Lua Cheia",
  luaMinguante: "🌗 Lua Minguante",
};
