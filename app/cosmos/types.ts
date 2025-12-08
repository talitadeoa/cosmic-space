export type ScreenId =
  | "home"
  | "solOrbit"
  | "luaList"
  | "planetCardBelowSun"
  | "planetCardStandalone"
  | "galaxySuns"
  | "ringGalaxy"
  | "sidePlanetCard"
  | "columnSolLuaPlaneta";

export type CelestialType =
  | "sol"
  | "lua"
  | "luaNova"
  | "luaCrescente"
  | "luaCheia"
  | "luaMinguante"
  | "planeta"
  | "galaxia"
  | "anel"
  | "eclipse";

export type CelestialSize = "sm" | "md" | "lg";

export type FocusState = {
  target: ScreenId;
  x: number;
  y: number;
  centerX: number;
  centerY: number;
  type: CelestialType;
  size: CelestialSize;
};

export type ScreenProps = {
  navigateTo: (next: ScreenId) => void;
  navigateWithFocus: (
    next: ScreenId,
    params: {
      event?: React.MouseEvent<HTMLDivElement>;
      type: CelestialType;
      size?: CelestialSize;
    }
  ) => void;
};
