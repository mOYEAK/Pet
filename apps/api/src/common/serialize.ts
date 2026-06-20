type SerializableRecord = Record<string, unknown>;

function isDecimalLike(value: unknown): value is { toNumber: () => number } {
  return (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  );
}

export function serializeEntity<T>(value: T): T {
  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (isDecimalLike(value)) {
    return value.toNumber() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeEntity(item)) as T;
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value as SerializableRecord).map(([key, item]) => [key, serializeEntity(item)])
    ) as T;
  }

  return value;
}
