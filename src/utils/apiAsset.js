const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const apiAssetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const origin = new URL(apiBase, window.location.origin).origin;
  return new URL(path, origin).toString();
};
