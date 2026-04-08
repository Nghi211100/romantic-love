import { TITLE } from "@/utils/common";
import React from "react";

export const Header = () => {
  return (
    <div className="pt-1 text-center md:pt-4">
      <p className="bg-gradient-to-r from-rose-100 via-pink-100 to-violet-100 bg-clip-text text-[32px] font-extrabold leading-tight text-transparent drop-shadow-2xl [text-shadow:_0_6px_18px_rgba(232,121,249,0.6)] sm:text-[40px] md:text-[64px]">
        {TITLE} <span className="text-white">❤️</span>
      </p>
    </div>
  );
};
