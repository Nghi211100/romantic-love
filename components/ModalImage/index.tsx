import React, {
  ChangeEvent,
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  SetStateAction,
  useEffect,
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
  caption: string;
  unoptimized?: boolean;
};

function displaySrc(url: string, name: string) {
  if (url.includes(".private.blob.vercel-storage.com")) {
    return `/api/album/file/${name
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
  }
  return url;
}

export const ModalImage = ({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFull, setShowFull] = useState(false);
  const [imageSelected, setImageSelected] = useState("");
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [draftCaption, setDraftCaption] = useState("");
  const [savingCaption, setSavingCaption] = useState(false);

  const loadUploadedPhotos = async () => {
    try {
      const response = await fetch("/api/album");
      if (!response.ok) return;
      const data = (await response.json()) as {
        images?: { name: string; url: string; caption?: string }[];
      };
      const images = data.images || [];
      setPhotos(
        images.map((image) => ({
          id: image.name,
          src: displaySrc(image.url, image.name),
          caption: image.caption || "",
          unoptimized: true,
        }))
      );
    } catch {
      // Album stays empty if listing blob images fails.
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

  const startEditCaption = (
    event: MouseEvent<HTMLButtonElement>,
    photo: AlbumPhoto
  ) => {
    event.stopPropagation();
    setEditingId(photo.id);
    setDraftCaption(photo.caption);
  };

  const saveCaption = async (photoId: string) => {
    const nextCaption = draftCaption.replace(/\s+/g, " ").trim();
    const current = photos.find((photo) => photo.id === photoId);
    setEditingId("");

    if (!current || nextCaption === current.caption) {
      return;
    }

    setPhotos((prev) =>
      prev.map((photo) =>
        photo.id === photoId ? { ...photo, caption: nextCaption } : photo
      )
    );
    setSavingCaption(true);
    try {
      const response = await fetch("/api/album", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: photoId, caption: nextCaption }),
      });
      if (!response.ok) {
        setPhotos((prev) =>
          prev.map((photo) =>
            photo.id === photoId
              ? { ...photo, caption: current.caption }
              : photo
          )
        );
        setErrorMessage("Không lưu được chú thích.");
      }
    } catch {
      setPhotos((prev) =>
        prev.map((photo) =>
          photo.id === photoId ? { ...photo, caption: current.caption } : photo
        )
      );
      setErrorMessage("Không lưu được chú thích.");
    } finally {
      setSavingCaption(false);
    }
  };

  const handleCaptionKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    photoId: string
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setEditingId("");
    }
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
              Chọn ảnh để xem full màn hình · bấm chú thích để sửa
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
                    alt={photo.caption || "Ảnh album"}
                    unoptimized={photo.unoptimized}
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {editingId === photo.id ? (
                  <input
                    autoFocus
                    value={draftCaption}
                    maxLength={200}
                    disabled={savingCaption}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setDraftCaption(event.target.value)}
                    onBlur={() => saveCaption(photo.id)}
                    onKeyDown={(event) => handleCaptionKeyDown(event, photo.id)}
                    className="mt-2 w-full rounded-lg border border-rose-200 bg-white px-2 py-1 text-center text-xs font-semibold text-rose-500 outline-none ring-rose-200 focus:ring-2 md:text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={(event) => startEditCaption(event, photo)}
                    className="mt-2 block w-full truncate text-center text-xs font-semibold text-rose-400 hover:text-rose-500 md:text-sm"
                  >
                    {photo.caption || "Thêm chú thích"}
                  </button>
                )}
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
