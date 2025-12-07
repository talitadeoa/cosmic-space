"use client";

import React from "react";
import { StarfieldBackground } from "./StarfieldBackground";
import { LuminousTrail } from "./LuminousTrail";

export const SpaceBackground: React.FC<{ showTrail?: boolean }> = ({
  showTrail = false,
}) => (
  <>
    <StarfieldBackground />
    {showTrail && <LuminousTrail />}
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#ffffff20_1px,transparent_0)] bg-[length:40px_40px] opacity-40" />
    <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />
    <div className="pointer-events-none absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
  </>
);
