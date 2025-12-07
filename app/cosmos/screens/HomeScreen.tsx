"use client";

import React from "react";
import { CelestialObject } from "../components/CelestialObject";
import type { ScreenProps } from "../types";

const HomeScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", { event: e, type: "sol", size: "md" })
        }
        className="absolute top-6 sm:top-12 left-4 sm:left-10"
        floatOffset={-2}
      />

      <CelestialObject
        type="buracoNegro"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("ringGalaxy", {
            event: e,
            type: "buracoNegro",
            size: "lg",
          })
        }
        className="absolute top-6 sm:top-10 left-1/2 -translate-x-1/2"
        floatOffset={-4}
      />

      <CelestialObject
        type="galaxia"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("galaxySuns", {
            event: e,
            type: "galaxia",
            size: "sm",
          })
        }
        className="absolute top-8 sm:top-16 right-4 sm:right-16"
        floatOffset={1}
      />

      <CelestialObject
        type="galaxia"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("galaxySuns", {
            event: e,
            type: "galaxia",
            size: "lg",
          })
        }
        className="absolute bottom-16 sm:bottom-24 left-4 sm:left-14"
        floatOffset={3}
      />

      <CelestialObject
        type="lua"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "lg" })
        }
        className="absolute bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2"
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
        className="absolute bottom-6 sm:bottom-10 right-4 sm:right-10"
        floatOffset={-1}
      />

      <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] uppercase text-slate-300/60 px-2 text-center">
        Clique em um astro · Clique no espaço para voltar
      </div>
    </div>
  );
};

export default HomeScreen;
