export const CAPTIONS_BLOB_NAME = "captions.json";
export const CAPTIONS_BLOB_PATH = `album/${CAPTIONS_BLOB_NAME}`;

export function formatDateVN(date: Date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function isCaptionsSidecar(name: string) {
  return name === CAPTIONS_BLOB_NAME;
}

export function normalizeCaption(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 200);
}

export type CaptionMap = Record<string, string>;

export function parseCaptionMap(raw: string): CaptionMap {
  try {
    const parsed = JSON.parse(raw) as { captions?: CaptionMap } | CaptionMap;
    if (parsed && typeof parsed === "object" && "captions" in parsed) {
      return parsed.captions && typeof parsed.captions === "object"
        ? parsed.captions
        : {};
    }
    if (parsed && typeof parsed === "object") {
      return parsed as CaptionMap;
    }
  } catch {
    // Ignore invalid sidecar JSON and start fresh.
  }
  return {};
}
