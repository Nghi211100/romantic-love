import Image from "next/image";
import React from "react";

export const Footer = () => {
  return (
    <div className="relative z-0 flex w-full pt-2 md:pt-10">
      <div className="w-1/2">
        <div className="car drop-shadow-xl">
          <Image src={"/images/car.png"} height={320} width={320} alt="car" />
        </div>
      </div>
      <div className="absolute bottom-0 right-0 h-1 w-full rounded-full bg-neutral-800/80"></div>
      <div className="street absolute -z-10 bottom-16 right-0 h-1 w-1/5 rounded-full bg-neutral-700/70"></div>
      <div className="street absolute -z-10 bottom-24 right-6 h-1 w-1/3 rounded-full bg-neutral-700/70"></div>
      <div className="street absolute -z-10 bottom-10 right-14 h-1 w-1/4 rounded-full bg-neutral-700/70"></div>
    </div>
  );
};
