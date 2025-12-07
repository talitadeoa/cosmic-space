"use client";

import React from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const RingGalaxyScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_55px_rgba(196,181,253,0.8)]"
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      >
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
          className="w-40"
        />
      </motion.div>

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
        className="absolute top-16 left-1/2 -translate-x-1/2"
        floatOffset={-2}
      />
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
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
        floatOffset={2}
      />
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
        className="absolute left-16 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
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
        className="absolute right-16 top-1/2 -translate-y-1/2"
        floatOffset={-1}
      />
    </div>
  );
};

export default RingGalaxyScreen;
