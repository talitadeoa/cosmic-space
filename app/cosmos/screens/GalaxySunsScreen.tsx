"use client";

import React from "react";
import { motion } from "framer-motion";
import { CelestialObject } from "../components/CelestialObject";
import type { ScreenProps } from "../types";

const GalaxySunsScreen: React.FC<ScreenProps> = ({ navigateWithFocus }) => {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <motion.div
        className="relative flex items-center justify-center"
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <CelestialObject
          type="galaxia"
          size="lg"
          interactive
          onClick={(e) =>
            navigateWithFocus("ringGalaxy", {
              event: e,
              type: "galaxia",
              size: "lg",
            })
          }
          floatOffset={0}
        />
      </motion.div>

      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute top-20 left-1/2 -translate-x-1/2"
        floatOffset={-2}
      />
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        floatOffset={2}
      />
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute left-20 top-1/2 -translate-y-1/2"
        floatOffset={1}
      />
      <CelestialObject
        type="sol"
        size="md"
        interactive
        onClick={(e) =>
          navigateWithFocus("solOrbit", {
            event: e,
            type: "sol",
            size: "md",
          })
        }
        className="absolute right-20 top-1/2 -translate-y-1/2"
        floatOffset={-1}
      />
    </div>
  );
};

export default GalaxySunsScreen;
