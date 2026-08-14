/**
 * Public URL for a products.image_paths entry.
 * Storage keys (e.g. seed/prod-1@2x.jpg) resolve to the product-images bucket.
 */
export function productImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return "";
  let key = path;
  if (key.startsWith("/images/products/")) {
    key = `seed/${key.slice("/images/products/".length)}`;
  } else if (key.startsWith("/")) {
    return "";
  }
  return `${base}/storage/v1/object/public/product-images/${key}`;
}

export function isStorageObjectKey(path: string): boolean {
  if (!path) return false;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return false;
  }
  return true;
}
