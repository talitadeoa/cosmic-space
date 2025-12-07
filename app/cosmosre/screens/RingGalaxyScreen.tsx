"use client";

import React from "react";
import { MoonPhase } from "../components/MoonPhase";
import { Card } from "../components/Card";
import type { ScreenProps } from "../types";

const RingGalaxyScreen: React.FC<ScreenProps> = ({
  navigateTo,
  navigateWithFocus,
}) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-4 border-violet-300/70 shadow-[0_0_55px_rgba(196,181,253,0.8)]">
        <Card
          interactive
          onClick={() => navigateTo("columnSolLuaPlaneta")}
          className="w-40"
        />
      </div>

      {/* Lua Cheia - Top */}
      <MoonPhase
        phase="cheia"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute top-20 left-1/2 -translate-x-1/2"
        floatOffset={-2}
      />
      
      {/* Lua Nova - Bottom */}
      <MoonPhase
        phase="nova"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        floatOffset={2}
      />
      
      {/* Quarto Crescente - Left */}
      <MoonPhase
        phase="quarto_crescente"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute left-20 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
      
      {/* Quarto Minguante - Right */}
      <MoonPhase
        phase="quarto_minguante"
        size="sm"
        interactive
        onClick={(e) =>
          navigateWithFocus("luaList", {
            event: e,
            type: "lua",
            size: "sm",
          })
        }
        className="absolute right-20 top-1/2 -translate-y-1/2"
        floatOffset={-1}
      />
    </div>
  );
};

export default RingGalaxyScreen;
