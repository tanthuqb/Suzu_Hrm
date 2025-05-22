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
