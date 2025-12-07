"use client";

import React from "react";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const SidePlanetCardScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center px-10">
      <div className="relative flex h-80 w-full max-w-4xl items-center justify-between">
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
          className="relative z-10 flex h-64 w-72 items-center justify-center"
        >
          <CelestialObject
            type="planeta"
            size="lg"
            className="absolute -right-10"
          />
        </Card>

        <div className="flex flex-col items-center gap-4 pr-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CelestialObject
              key={`col-lua-${i}`}
              type="lua"
              size="sm"
              interactive
              onClick={(e) =>
                navigateWithFocus("planetCardStandalone", {
                  event: e,
                  type: "lua",
                  size: "sm",
                })
              }
              floatOffset={i * 1.5 - 3}
            />
          ))}
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
          className="absolute -top-6 right-24"
          floatOffset={-2}
        />
      </div>
    </div>
  );
};

export default SidePlanetCardScreen;
