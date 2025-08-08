export interface TResponse<TData = undefined, TMetadata = undefined> {
  data?: TData;
  message?: string;
  metadata?: TMetadata;
  error?: string;
  status?: number;
}
