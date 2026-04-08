import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import Modal from "../Modal";
import Image from "next/image";
import { ImageShowModal } from "./ImageShowModal";

export const ModalImage = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  const listImage = useMemo<number[]>(() => {
    return Array.from({ length: 24 }, (_, index) => index + 1);
  }, []);

  const [showFull, setShowFull] = useState(false);
  const [imageSelected, setImageSelected] = useState("");

  const openImage = (imageNumber: number) => {
    setImageSelected(`/images/${imageNumber}.jpg`);
    setShowFull(true);
  };

  return (
    <Modal show={show} onCancel={() => setShow(false)} showCloseBtn={false}>
      <div className="w-[calc(100vw-16px)] rounded-3xl border border-white/60 bg-gradient-to-br from-rose-50 via-pink-100 to-purple-100 p-3 text-red-500 shadow-2xl md:h-[760px] md:w-[1020px] md:p-5">
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/70 bg-white/60 px-4 py-3 backdrop-blur-sm">
          <div className="text-left">
            <p className="text-2xl font-bold text-rose-500">Album của chúng ta</p>
            <p className="text-sm text-rose-400">Chọn ảnh để xem full màn hình</p>
          </div>
          <button
            type="button"
            onClick={() => setShow(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-lg font-semibold text-rose-400 shadow-sm transition-colors hover:bg-rose-500 hover:text-white font-sans"
          >
            X
          </button>
        </div>

        <div className="css-scroll h-[70vh] overflow-y-auto rounded-2xl border border-dashed border-rose-200 bg-white/55 p-3 md:h-[640px] md:p-4">
          <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {listImage.map((image) => (
              <div
                key={image}
                className="group cursor-pointer rounded-2xl border border-rose-100 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-pink-300/60"
                onClick={() => openImage(image)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    src={`/images/${image}.jpg`}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    loading="lazy"
                    alt={`album-${image}`}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 text-center text-sm font-semibold text-rose-400">
                  Khoảnh khắc #{image}
                </p>
              </div>
            ))}
          </div>
        </div>
        <ImageShowModal
          setShow={setShowFull}
          show={showFull}
          imageSelected={imageSelected}
        />
      </div>
    </Modal>
  );
};
