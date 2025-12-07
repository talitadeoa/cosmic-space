"use client";

import React from "react";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const PlanetCardStandaloneScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Card
        interactive
        onClick={() => navigateTo("columnSolLuaPlaneta")}
        className="relative flex aspect-[4/3] w-80 items-center justify-end"
      >
        <CelestialObject
          type="lua"
          size="sm"
          interactive
          onClick={(e) =>
            navigateWithFocus("luaList", {
              event: e,
              type: "lua",
              size: "sm",
            })
          }
          className="absolute -top-6 -left-4"
          floatOffset={-2}
        />
        <CelestialObject
          type="sol"
          size="sm"
          interactive
          onClick={(e) =>
            navigateWithFocus("planetCardBelowSun", {
              event: e,
              type: "sol",
              size: "sm",
            })
          }
          className="absolute -top-6 -right-4"
          floatOffset={1}
        />
        <CelestialObject
          type="planeta"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("columnSolLuaPlaneta", {
              event: e,
              type: "planeta",
              size: "lg",
            })
          }
          className="absolute -bottom-8 left-1/2 -translate-x-1/2"
          floatOffset={3}
        />
      </Card>
    </div>
  );
};

export default PlanetCardStandaloneScreen;
