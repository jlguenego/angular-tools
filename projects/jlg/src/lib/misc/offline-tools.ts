import * as localforage from 'localforage';
import { OfflineOrder } from '../interfaces/offline-order';

export const OFFLINE_ORDERSTACK_NAME = 'offline-orderstack';

export const getDefaultItem = async <T>(
  name: string,
  defaultValue: T
): Promise<T> => {
  const result = await localforage.getItem<T>(name);
  if (result === null || result === undefined) {
    return defaultValue;
  }
  return result;
};

export const addOrder = async <T>(order: OfflineOrder<T>) => {
  const orderStack = await getDefaultItem<OfflineOrder<T>[]>(
    OFFLINE_ORDERSTACK_NAME,
    []
  );
  orderStack.push(order);
  await localforage.setItem(OFFLINE_ORDERSTACK_NAME, orderStack);
};
