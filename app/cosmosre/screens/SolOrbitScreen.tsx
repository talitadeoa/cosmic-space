"use client";

import React from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const SolOrbitScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="absolute h-64 w-64 rounded-[40%] border-2 border-sky-400/50"
        animate={{ rotate: [0, 6, -6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <Card
        interactive
        onClick={() => navigateTo("planetCardBelowSun")}
        className="relative z-10 flex aspect-[4/3] w-72 items-center justify-center"
      >
        <CelestialObject type="sol" size="lg" interactive={false} />
      </Card>

      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute -top-4 left-1/2 -translate-x-1/2"
      />
      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        floatOffset={3}
      />
      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute left-8 top-1/2 -translate-y-1/2"
        floatOffset={-2}
      />
      <CelestialObject
        type="lua"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", { event: e, type: "lua", size: "md" })
        }
        className="absolute right-8 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
    </div>
  );
};

export default SolOrbitScreen;
