import { PaginationQuery, MetaResponse } from "@/types/app.type";

export const getPaginationParams = (query: PaginationQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const perPage = Math.max(Number(query.limit) || 10, 1);
  const skip = (page - 1) * perPage;

  return { page, perPage, skip };
};

export const createMeta = (
  total: number,
  page: number,
  limit: number
): MetaResponse => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
