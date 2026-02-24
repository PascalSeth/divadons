export type PaginationMeta = {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export function paginate(page: number, pageSize: number) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const normalizedPageSize =
    Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 20;
  const safePageSize = Math.min(normalizedPageSize, 100);

  const skip = (safePage - 1) * safePageSize;
  const take = safePageSize;

  return { skip, take, page: safePage, pageSize: safePageSize };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  pageSize: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    total,
    page,
    pageSize,
    totalPages,
  };
}

