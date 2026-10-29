const fs = require("fs");
const path = require("path");
const { list, put } = require("@vercel/blob");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function putWithStoreAccess(pathname, body, token) {
  const options = {
    addRandomSuffix: false,
    allowOverwrite: true,
    token,
    contentType: "image/jpeg",
  };
  try {
    return await put(pathname, body, { ...options, access: "public" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.toLowerCase().includes("private")) throw error;
    return await put(pathname, body, { ...options, access: "private" });
  }
}

async function main() {
  const root = path.join(__dirname, "..");
  loadDotEnv(path.join(root, ".env"));
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Missing BLOB_READ_WRITE_TOKEN");
  }

  const { blobs } = await list({ prefix: "album/", token });
  const existing = new Set(blobs.map((blob) => blob.pathname));

  const results = [];
  for (let i = 0; i <= 24; i += 1) {
    const fileName = `${i}.jpg`;
    const pathname = `album/${fileName}`;
    const localPath = path.join(root, "public", "images", fileName);
    if (!fs.existsSync(localPath)) {
      results.push({ fileName, status: "missing-local" });
      continue;
    }
    if (existing.has(pathname)) {
      const found = blobs.find((blob) => blob.pathname === pathname);
      results.push({
        fileName,
        status: "skipped",
        url: found ? found.url : pathname,
      });
      continue;
    }
    const body = fs.readFileSync(localPath);
    const blob = await putWithStoreAccess(pathname, body, token);
    results.push({
      fileName,
      status: "uploaded",
      url: blob.url,
      pathname: blob.pathname,
    });
  }

  const uploaded = results.filter((item) => item.status === "uploaded").length;
  const skipped = results.filter((item) => item.status === "skipped").length;
  const missing = results.filter((item) => item.status === "missing-local").length;
  console.log(
    JSON.stringify({
      uploaded,
      skipped,
      missing,
      sample: results.slice(0, 3).map((item) => ({
        fileName: item.fileName,
        status: item.status,
        url: item.url,
      })),
      files: results.map((item) => ({
        fileName: item.fileName,
        status: item.status,
        url: item.url,
      })),
    })
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exit(1);
});
