"use client";

import React, { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { SpaceBackground } from "./components/SpaceBackground";
import { CelestialObject } from "./components/CelestialObject";

import type {
  ScreenId,
  FocusState,
  ScreenProps,
  CelestialType,
  CelestialSize,
} from "./types";

import HomeScreen from "./screens/HomeScreen";
import SolOrbitScreen from "./screens/SolOrbitScreen";
import LuaListScreen from "./screens/LuaListScreen";
import PlanetCardBelowSunScreen from "./screens/PlanetCardBelowSunScreen";
import PlanetCardStandaloneScreen from "./screens/PlanetCardStandaloneScreen";
import GalaxySunsScreen from "./screens/GalaxySunsScreen";
import RingGalaxyScreen from "./screens/RingGalaxyScreen";
import SidePlanetCardScreen from "./screens/SidePlanetCardScreen";
import ColumnSolLuaPlanetaScreen from "./screens/ColumnSolLuaPlanetaScreen";

const screenVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.32, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.22, ease: "easeIn" },
  },
};

const screens: Record<ScreenId, React.FC<ScreenProps>> = {
  home: HomeScreen,
  solOrbit: SolOrbitScreen,
  luaList: LuaListScreen,
  planetCardBelowSun: PlanetCardBelowSunScreen,
  planetCardStandalone: PlanetCardStandaloneScreen,
  galaxySuns: GalaxySunsScreen,
  ringGalaxy: RingGalaxyScreen,
  sidePlanetCard: SidePlanetCardScreen,
  columnSolLuaPlaneta: ColumnSolLuaPlanetaScreen,
};

const CosmosPage: React.FC = () => {
  const [screenStack, setScreenStack] = useState<ScreenId[]>(["home"]);
  const currentScreen = screenStack[screenStack.length - 1];

  const [focus, setFocus] = useState<FocusState | null>(null);

  const navigateTo = useCallback((next: ScreenId) => {
    setScreenStack((prev) => [...prev, next]);
  }, []);

  const goBack = useCallback(() => {
    setScreenStack((prev) => (prev.length <= 1 ? prev : prev.slice(0, -1)));
  }, []);

  const handleBackgroundClick = () => {
    if (screenStack.length > 1) {
      goBack();
    }
  };

  const navigateWithFocus = useCallback<
    ScreenProps["navigateWithFocus"]
  >((next, params) => {
    const { event, type, size = "md" } = params;

    if (!event || typeof window === "undefined") {
      setScreenStack((prev) => [...prev, next]);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    setFocus({
      target: next,
      x,
      y,
      centerX,
      centerY,
      type,
      size,
    });

    setTimeout(() => {
      setScreenStack((prev) => [...prev, next]);
      setFocus(null);
    }, 500);
  }, []);

  const CurrentScreen = screens[currentScreen];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-slate-50"
      onClick={handleBackgroundClick}
    >
      <SpaceBackground />

      <AnimatePresence>
        {focus && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute"
              initial={{ x: focus.x, y: focus.y, scale: 1 }}
              animate={{
                x: focus.centerX,
                y: focus.centerY,
                scale: 3,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <CelestialObject
                type={focus.type as CelestialType}
                size={focus.size as CelestialSize}
                interactive={false}
                pulseOnMount={false}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-screen flex-col overflow-y-auto">
        <div className="pointer-events-none absolute top-2 sm:top-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-slate-900/60 px-3 sm:px-4 py-1 text-[0.65rem] sm:text-xs text-slate-200/70">
          Tela: <span className="font-semibold">{currentScreen}</span>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-2 sm:px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="relative min-h-[75vh] sm:min-h-[80vh] w-full sm:w-[90vw] max-w-5xl"
            >
              <CurrentScreen
                navigateTo={navigateTo}
                navigateWithFocus={navigateWithFocus}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CosmosPage;
