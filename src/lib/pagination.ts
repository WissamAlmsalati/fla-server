export type PaginationMeta = {
  count: number;
  nextCursor: number | null;
};

export function parsePaginationMeta<T extends { id: number }>(
  results: T[],
  limit: number,
): PaginationMeta {
  return {
    count: results.length,
    nextCursor: results.length === limit ? results[results.length - 1].id : null,
  };
}
