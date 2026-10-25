import "server-only";

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

export type SafeImageType = keyof typeof IMAGE_TYPES;

function bytesMatch(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((value, index) => bytes[offset + index] === value);
}

function hasValidSignature(bytes: Uint8Array, type: SafeImageType): boolean {
  if (type === "image/jpeg") return bytesMatch(bytes, [0xff, 0xd8, 0xff]);
  if (type === "image/png") return bytesMatch(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (type === "image/gif") {
    return bytesMatch(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || bytesMatch(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
  }
  return bytesMatch(bytes, [0x52, 0x49, 0x46, 0x46]) && bytesMatch(bytes, [0x57, 0x45, 0x42, 0x50], 8);
}

export async function validateImageFile(
  file: File,
  maximumSizeInBytes: number,
): Promise<{ contentType: SafeImageType; extension: string }> {
  if (file.size <= 0) throw new Error("Berkas gambar kosong.");
  if (file.size > maximumSizeInBytes) {
    throw new Error(`Ukuran gambar maksimal ${Math.floor(maximumSizeInBytes / (1024 * 1024))} MB.`);
  }

  const contentType = file.type.toLowerCase() as SafeImageType;
  if (!(contentType in IMAGE_TYPES)) {
    throw new Error("Format gambar harus JPG, PNG, WebP, atau GIF.");
  }

  const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!hasValidSignature(header, contentType)) {
    throw new Error("Isi berkas tidak sesuai dengan format gambarnya.");
  }

  return { contentType, extension: IMAGE_TYPES[contentType] };
}

export function safeImageExtension(contentType: string): string {
  return IMAGE_TYPES[contentType as SafeImageType] ?? "jpg";
}
