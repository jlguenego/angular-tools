export type OfflineOrder<T> = AddOrder<T> | RemoveOrder;

export interface AddOrder<T> {
  type: 'add';
  document: T;
}
export interface RemoveOrder {
  type: 'remove';
  ids: string[];
}
