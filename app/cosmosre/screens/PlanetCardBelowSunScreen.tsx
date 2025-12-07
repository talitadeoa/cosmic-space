"use client";

import React from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const PlanetCardBelowSunScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-between py-10">
      <CelestialObject
        type="sol"
        size="lg"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "lg",
          })
        }
        floatOffset={-3}
      />

      <Card
        interactive
        onClick={() => navigateTo("sidePlanetCard")}
        className="mt-4 flex aspect-[4/3] w-80 items-center justify-center"
      >
        <CelestialObject type="planeta" size="lg" />
      </Card>

      <div className="relative mb-6 flex items-center justify-center">
        <motion.div
          className="absolute h-px w-80 bg-gradient-to-r from-sky-300/40 via-sky-500/80 to-sky-300/40"
          animate={{ x: [0, 12, -12, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CelestialObject
              key={`bottom-lua-${i}`}
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
              floatOffset={i - 2}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanetCardBelowSunScreen;
