import React, { Dispatch, SetStateAction } from "react";
import Modal from "../Modal";
import Image from "next/image";

export const ImageShowModal = ({
  show,
  setShow,
  imageSelected,
}: {
  imageSelected: string;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Modal show={show} onCancel={() => setShow(false)} showCloseBtn={false}>
      <div className="relative h-screen w-screen">
        <div className="absolute inset-0 bg-black/90"></div>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="absolute right-3 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/80 font-sans text-lg font-bold text-rose-500 shadow-md transition-colors hover:bg-rose-500 hover:text-white"
        >
          x
        </button>
        <div className="relative mx-auto h-[86%] w-[94%] pt-8 md:h-[90%] md:w-[90%] md:pt-0">
          <Image
            src={imageSelected}
            alt="love"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </Modal>
  );
};
