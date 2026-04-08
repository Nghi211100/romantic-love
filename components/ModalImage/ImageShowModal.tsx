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
    <Modal show={show} onCancel={() => setShow(false)}>
      <div className="relative h-screen w-screen">
        <div className="absolute inset-0 bg-black/90"></div>
        <div className="relative mx-auto h-[90%] w-[90%]">
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
