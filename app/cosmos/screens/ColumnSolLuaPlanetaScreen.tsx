"use client";

import React from "react";
import { CelestialObject } from "../components/CelestialObject";
import type { ScreenProps } from "../types";

const ColumnSolLuaPlanetaScreen: React.FC<ScreenProps> = ({
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-10">
        <CelestialObject
          type="sol"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("home", { event: e, type: "sol", size: "lg" })
          }
          floatOffset={-4}
        />
        <CelestialObject
          type="lua"
          size="md"
          interactive
          onClick={(e) =>
            navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
          }
          floatOffset={0}
        />
        <CelestialObject
          type="planeta"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("planetCardStandalone", {
              event: e,
              type: "planeta",
              size: "lg",
            })
          }
          floatOffset={3}
        />
      </div>
    </div>
  );
};

export default ColumnSolLuaPlanetaScreen;
