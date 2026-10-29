import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Modal from "../Modal";
import Image from "next/image";
import { ImageShowModal } from "./ImageShowModal";
import {
  FORMAT_ERROR_MESSAGE,
  splitImageFiles,
} from "@/utils/imageFile";

type AlbumPhoto = {
  id: string;
  src: string;
  label: string;
  unoptimized?: boolean;
};

export const ModalImage = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const listImage = useMemo<number[]>(() => {
    return Array.from({ length: 24 }, (_, index) => index + 1);
  }, []);

  const [showFull, setShowFull] = useState(false);
  const [imageSelected, setImageSelected] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<AlbumPhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const builtInPhotos = useMemo<AlbumPhoto[]>(
    () =>
      listImage.map((image) => ({
        id: `built-in-${image}`,
        src: `/images/${image}.jpg`,
        label: `Khoảnh khắc #${image}`,
      })),
    [listImage]
  );

  const photos = useMemo(
    () => [...uploadedPhotos, ...builtInPhotos],
    [builtInPhotos, uploadedPhotos]
  );

  const loadUploadedPhotos = async () => {
    try {
      const response = await fetch("/api/album");
      if (!response.ok) return;
      const data = (await response.json()) as {
        images?: { name: string; url: string }[];
      };
      setUploadedPhotos(
        (data.images || []).map((image, index) => ({
          id: image.name,
          src: image.url,
          label: `Ảnh mới #${(data.images || []).length - index}`,
          unoptimized: true,
        }))
      );
    } catch {
      // Keep built-in album if listing uploaded files fails.
    }
  };

  useEffect(() => {
    if (show) {
      loadUploadedPhotos();
    }
  }, [show]);

  const openImage = (photo: AlbumPhoto) => {
    setImageSelected(photo.src);
    setShowFull(true);
  };

  const handleSelectFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    setErrorMessage("");

    if (!selected.length) return;

    const { validFiles, invalidNames } = splitImageFiles(selected);

    if (!validFiles.length) {
      setErrorMessage(FORMAT_ERROR_MESSAGE);
      return;
    }

    if (invalidNames.length) {
      setErrorMessage(
        `${FORMAT_ERROR_MESSAGE} File không hợp lệ: ${invalidNames.join(", ")}`
      );
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/album", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        message?: string;
        invalidNames?: string[];
        uploaded?: { name: string; url: string }[];
      };

      if (!response.ok) {
        setErrorMessage(data.message || FORMAT_ERROR_MESSAGE);
        return;
      }

      if (data.invalidNames?.length) {
        setErrorMessage(
          `${FORMAT_ERROR_MESSAGE} File không hợp lệ: ${data.invalidNames.join(
            ", "
          )}`
        );
      }

      await loadUploadedPhotos();
    } catch {
      setErrorMessage("Upload thất bại, thử lại nhé.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal show={show} onCancel={() => setShow(false)} showCloseBtn={false}>
      <div className="w-[calc(100vw-10px)] rounded-3xl border border-white/60 bg-gradient-to-br from-rose-50 via-pink-100 to-purple-100 p-2 text-red-500 shadow-2xl md:h-[760px] md:w-[1020px] md:p-5">
        <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/60 px-3 py-2 backdrop-blur-sm md:mb-3 md:px-4 md:py-3">
          <div className="text-left">
            <p className="text-lg font-bold text-rose-500 md:text-2xl">
              Album của chúng ta
            </p>
            <p className="text-xs text-rose-400 md:text-sm">
              Chọn ảnh để xem full màn hình
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleSelectFiles}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-500 shadow-sm transition-colors hover:bg-rose-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60 md:px-4 md:text-sm"
            >
              {isUploading ? "Đang tải..." : "Thêm ảnh"}
            </button>
            <button
              type="button"
              onClick={() => setShow(false)}
              className="font-sans flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-white text-lg font-semibold text-rose-400 shadow-sm transition-colors hover:bg-rose-500 hover:text-white md:h-9 md:w-9"
            >
              X
            </button>
          </div>
        </div>

        {errorMessage ? (
          <p className="mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-left text-xs font-semibold text-rose-600 md:text-sm">
            {errorMessage}
          </p>
        ) : null}

        <div className="css-scroll h-[72vh] overflow-y-auto rounded-2xl border border-dashed border-rose-200 bg-white/55 p-2 md:h-[640px] md:p-4">
          <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group cursor-pointer rounded-2xl border border-rose-100 bg-white p-2 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-pink-300/60"
                onClick={() => openImage(photo)}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    src={photo.src}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    loading="lazy"
                    alt={photo.label}
                    unoptimized={photo.unoptimized}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="mt-2 text-center text-xs font-semibold text-rose-400 md:text-sm">
                  {photo.label}
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
