"use client";

export type IslandId = "ilha1" | "ilha2" | "ilha3" | "ilha4";
export type IslandNames = Record<IslandId, string>;

export const ISLAND_IDS: IslandId[] = ["ilha1", "ilha2", "ilha3", "ilha4"];

export const DEFAULT_ISLAND_NAMES: IslandNames = {
  ilha1: "Ilha 1",
  ilha2: "Ilha 2",
  ilha3: "Ilha 3",
  ilha4: "Ilha 4",
};

export const ISLAND_NAMES_STORAGE_KEY = "cosmic_space_island_names";

const sanitizeIslandName = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
};

export const loadIslandNames = (): IslandNames => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_ISLAND_NAMES };
  }

  try {
    const stored = localStorage.getItem(ISLAND_NAMES_STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_ISLAND_NAMES };
    }

    const parsed = JSON.parse(stored) as Partial<Record<IslandId, unknown>>;
    const nextNames: IslandNames = { ...DEFAULT_ISLAND_NAMES };

    ISLAND_IDS.forEach((islandId) => {
      nextNames[islandId] = sanitizeIslandName(parsed?.[islandId], nextNames[islandId]);
    });

    return nextNames;
  } catch (error) {
    console.warn("Falha ao carregar nomes das ilhas", error);
    return { ...DEFAULT_ISLAND_NAMES };
  }
};

export const saveIslandNames = (names: IslandNames) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(ISLAND_NAMES_STORAGE_KEY, JSON.stringify(names));
  } catch (error) {
    console.warn("Falha ao salvar nomes das ilhas", error);
  }
};

export const getIslandLabel = (
  islandId: IslandId | null | undefined,
  names?: IslandNames,
) => {
  if (!islandId) return null;
  return (names ?? DEFAULT_ISLAND_NAMES)[islandId] ?? DEFAULT_ISLAND_NAMES[islandId];
};
