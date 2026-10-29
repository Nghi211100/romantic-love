export const ALLOWED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".bmp",
  ".avif",
  ".heic",
  ".heif",
];

export const FORMAT_ERROR_MESSAGE =
  "Sai định dạng. Chỉ được upload file ảnh (jpg, jpeg, png, gif, webp, ...).";

export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot < 0) return "";
  return fileName.slice(lastDot).toLowerCase();
}

export function isAllowedImageFile(file: {
  name: string;
  type?: string;
}): boolean {
  const mime = (file.type || "").toLowerCase();
  const ext = getFileExtension(file.name);

  if (mime) {
    if (!mime.startsWith("image/") || mime === "image/svg+xml") {
      return false;
    }
    return true;
  }

  return ALLOWED_IMAGE_EXTENSIONS.includes(ext);
}

export function splitImageFiles(files: File[]): {
  validFiles: File[];
  invalidNames: string[];
} {
  const validFiles: File[] = [];
  const invalidNames: string[] = [];

  files.forEach((file) => {
    if (isAllowedImageFile(file)) {
      validFiles.push(file);
    } else {
      invalidNames.push(file.name);
    }
  });

  return { validFiles, invalidNames };
}
