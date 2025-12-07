"use client";

import React from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import { LuminousTrail } from "../components/LuminousTrail";
import type { CelestialType, ScreenProps } from "../types";

const LuaListScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  const moonPhases: CelestialType[] = [
    "luaNova",
    "luaCrescente",
    "luaCheia",
    "luaMinguante",
  ];

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-16">
      <LuminousTrail />

      <CelestialObject
        type="sol"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("planetCardBelowSun", {
            event: e,
            type: "sol",
            size: "lg",
          })
        }
        className="mt-4"
        floatOffset={-3}
      />

      <div className="relative flex flex-col items-center gap-6">
        <div className="flex gap-6">
          {moonPhases.slice(0, 2).map((phase, i) => (
            <CelestialObject
              key={phase}
              type={phase}
              interactive
              onClick={(e) =>
                navigateWithFocus("planetCardStandalone", {
                  event: e,
                  type: phase,
                  size: "md",
                })
              }
              floatOffset={-1 + i * 1.2}
            />
          ))}
        </div>

        <motion.div
          className="h-0.5 w-72 bg-gradient-to-r from-sky-300/60 via-sky-500/80 to-sky-300/60"
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex gap-6">
          {moonPhases.slice(2).map((phase, i) => (
            <CelestialObject
              key={phase}
              type={phase}
              interactive
              onClick={(e) =>
                navigateWithFocus("planetCardStandalone", {
                  event: e,
                  type: phase,
                  size: "md",
                })
              }
              floatOffset={1.2 - i * 1.2}
            />
          ))}
        </div>
      </div>

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
        className="mb-4"
        floatOffset={2}
      />
    </div>
  );
};

export default LuaListScreen;
