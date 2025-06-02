import type { DehydratedState } from "@tanstack/react-query";

export function enumToArray<T extends Record<string, string | number>>(
  enumObj: T,
) {
  return Object.entries(enumObj).map(([key, value]) => ({
    id: key,
    label: value,
  }));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function toISOStringSafe(val: any): string {
  if (!val) return new Date().toISOString();
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
    throw new Error("Invalid datetime string");
  }
  throw new Error("Invalid datetime value");
}

export const IMAGE_VALIDATION = {
  maxSize: 5 * 1024 * 1024,
  minSize: 1024,
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  maxWidth: 2048,
  maxHeight: 2048,
  minWidth: 100,
  minHeight: 100,
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

export function getRelativePath(url: string) {
  try {
    const u = new URL(url);
    return u.pathname + u.search;
  } catch {
    return url;
  }
}

export const transformData = (
  apiData: { month: number | string; count: number | string }[],
): number[] => {
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  return months.map((month) => {
    const monthData = apiData.find((item) => Number(item.month) === month);
    return monthData ? Number(monthData.count) : 0;
  });
};

export function mergeDehydratedStates(
  states: DehydratedState[],
): DehydratedState {
  return {
    queries: states.flatMap((s) => s.queries),
    mutations: states.flatMap((s) => s.mutations),
  };
}
