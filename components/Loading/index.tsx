"use client";
import classNames from "classnames";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

export const Loading = ({
  show,
  time,
  setTime,
}: {
  show: boolean;
  time: number;
  setTime: Dispatch<SetStateAction<number>>;
}) => {
  useEffect(() => {
    if (time < 100) {
      const timeOut = setInterval(() => {
        setTime(time + 1);
      }, 30);

      return () => clearInterval(timeOut);
    }
  }, [setTime, time]);

  return (
    <div
      className={classNames(
        "relative h-[44px] w-[calc(100vw-24px)] overflow-hidden rounded-2xl border-2 border-white/80 bg-white/40 shadow-lg shadow-pink-300/50 transition-all duration-300 md:w-[440px]",
        show && "translate-y-[-210px] md:translate-y-[-300px]"
      )}
    >
      <div className="hidden md:block h-full">
        <div
          style={{ width: `calc(436px*${time}/100)` }}
          className="flex h-full items-center justify-end rounded-2xl bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-200 pr-2"
        >
          💞
        </div>
      </div>
      <div className="block md:hidden h-full">
        <div
          style={{ width: `calc((100vw - 24px)*${time}/100)` }}
          className="flex h-full items-center justify-end rounded-2xl bg-gradient-to-r from-pink-200 via-rose-200 to-fuchsia-200 pr-2"
        >
          💞
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center text-xl">
        {time < 100 ? (
          <p className="text-lg font-semibold text-rose-500 drop-shadow">
            Đang kết nối ...
          </p>
        ) : (
          <p className="text-lg font-semibold text-rose-600 drop-shadow">
            Đã chạm đến trái tim :))
          </p>
        )}
      </div>
    </div>
  );
};
