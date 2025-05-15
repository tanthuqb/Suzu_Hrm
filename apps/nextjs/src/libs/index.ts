export function enumToArray<T extends Record<string, string | number>>(
  enumObj: T,
) {
  return Object.entries(enumObj).map(([key, value]) => ({
    id: key,
    label: value,
  }));
}
