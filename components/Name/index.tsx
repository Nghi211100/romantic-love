import { NAME } from "@/utils/common";
import React from "react";

export const Name = () => {
  return (
    <p className="rounded-full border border-white/70 bg-white/30 px-5 py-2 text-center text-4xl shadow-lg backdrop-blur-md">
      ❤️
      <span className="bg-gradient-to-r from-fuchsia-200 via-rose-200 to-violet-200 bg-clip-text text-4xl font-black text-transparent">
        <span className="[text-shadow:_0_2px_2px_rgba(157,23,77,0.65),_0_0_10px_rgba(244,114,182,0.75)]">
          {NAME}
        </span>
      </span>
      ❤️
    </p>
  );
};
