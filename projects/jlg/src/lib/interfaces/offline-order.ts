export type HttpMethod = 'POST' | 'DELETE' | 'PUT' | 'PATCH';

export interface OfflineOrder {
  method: HttpMethod;
  url: string;
  body: unknown;
  type?: 'formdata';
}
