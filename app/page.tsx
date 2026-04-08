"use client";

import { Audio } from "@/components/Audio";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Loading } from "@/components/Loading";
import { ModalCenter } from "@/components/ModalCenter";
import { ModalImage } from "@/components/ModalImage";
import { Name } from "@/components/Name";
import classNames from "classnames";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [showMail, setShowMail] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [time, setTime] = useState(0);
  return (
    <main className="relative z-0 flex min-h-screen overflow-hidden flex-col justify-center items-center gap-4 bg-[url('/images/background.jpg')] bg-cover bg-center p-2 pb-6 text-xl md:gap-6 md:p-10 md:pb-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-rose-900/20 to-black/35" />
      <div className="pointer-events-none absolute -top-20 right-[-80px] h-56 w-56 rounded-full bg-pink-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-[-40px] h-52 w-52 rounded-full bg-purple-300/30 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-5 rounded-3xl border border-white/30 bg-white/10 px-3 py-4 shadow-2xl backdrop-blur-sm md:gap-6 md:p-8">
        <Header />
        <Audio />
        <div className="pt-2 md:pt-8">
          <Loading show={showMail || showImage} time={time} setTime={setTime} />
        </div>

        <div className="flex w-full flex-col justify-center gap-3 text-white sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4">
          <button
            className={classNames(
              "w-full rounded-xl border border-white/30 bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-rose-400 hover:to-pink-400 hover:shadow-pink-400/40 sm:w-auto sm:text-lg",
              time === 100 ? "block" : "hidden"
            )}
            onClick={() => setShowMail(true)}
          >
            Đọc thư ở đây nè
          </button>
          <button
            className={classNames(
              "w-full rounded-xl border border-white/30 bg-gradient-to-r from-fuchsia-500 to-violet-500 px-5 py-3 text-base font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-fuchsia-400 hover:to-violet-400 hover:shadow-violet-400/40 sm:w-auto sm:text-lg",
              time === 100 ? "block" : "hidden"
            )}
            onClick={() => setShowImage(true)}
          >
            Xem ảnh ở đây nè
          </button>
        </div>

        <Footer />
        <Name />
      </div>

      <ModalCenter show={showMail} setShow={setShowMail} />
      <ModalImage show={showImage} setShow={setShowImage} />
      <div className="fixed inset-0 -z-10 h-screen w-screen opacity-10 blur-sm">
        <Image src={"/images/25.jpg"} fill className="object-cover" alt="" />
      </div>
    </main>
  );
}
