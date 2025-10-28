export interface ApiResponse<T = any> {
  message: string;
  error: string | Record<string, any> | null;
  data: T | null;
  meta?: MetaResponse;
  success:boolean;
}

export interface MetaResponse {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
  [key: string]: any;
}


export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}


export interface ServiceResponse{
  message:string;
  data?:any;
  meta?:MetaResponse;
}