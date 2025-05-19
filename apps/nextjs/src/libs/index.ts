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
