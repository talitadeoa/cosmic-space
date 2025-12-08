"use client";

import React from "react";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const MOON_COUNT = 4;

const SidePlanetCardScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center px-10">
      {/* wrapper central para impedir que o card seja puxado pras bordas */}
      <div className="relative flex h-80 w-full max-w-5xl items-center justify-center">
        {/* bloco do planeta + card */}
        <div className="relative flex items-center justify-center">
          <Card
            interactive
            onClick={() => navigateTo("columnSolLuaPlaneta")}
            className="relative z-10 flex h-64 w-72 items-center justify-center"
          />
          <CelestialObject
            type="planeta"
            size="lg"
            className="absolute -left-16"
          />
        </div>

        {/* bloco luas + sol */}
        <div className="absolute right-0 flex items-center gap-8 pr-6">
          <div className="flex flex-col items-center gap-4">
            {Array.from({ length: MOON_COUNT }).map((_, i) => {
              const moonTypes = ["luaNova", "luaCrescente", "luaCheia", "luaMinguante"] as const;
              const moonType = moonTypes[i % moonTypes.length];
              const isEven = i % 2 === 0;

              // agora o zigzag é mais evidente
              const horizontalOffset = isEven
                ? "-translate-x-6"
                : "translate-x-6";

              const floatOffset = i * 1.5 - 3;

              return (
                <CelestialObject
                  key={`zigzag-lua-${i}`}
                  type={moonType}
                  size="sm"
                  interactive
                  onClick={(e) =>
                    navigateWithFocus("planetCardStandalone", {
                      event: e,
                      type: moonType,
                      size: "sm",
                    })
                  }
                  floatOffset={floatOffset}
                  className={`${horizontalOffset} transition-transform duration-300`}
                />
              );
            })}
          </div>

          <CelestialObject
            type="sol"
            size="md"
            interactive
            onClick={(e) =>
              navigateWithFocus("planetCardBelowSun", {
                event: e,
                type: "sol",
                size: "md",
              })
            }
            floatOffset={-2}
          />
        </div>
      </div>
    </div>
  );
};

export default SidePlanetCardScreen;
