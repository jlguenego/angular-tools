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

export const addOrder = async (order: OfflineOrder) => {
  try {
    const orderStack = await getDefaultItem<OfflineOrder[]>(
      OFFLINE_ORDERSTACK_NAME,
      []
    );
    const storableOrder = handleFormData(order);

    orderStack.push(storableOrder);
    await localforage.setItem(OFFLINE_ORDERSTACK_NAME, orderStack);
  } catch (err) {
    console.error('err: ', err);
    throw err;
  }
};

export const getOrders = async (): Promise<OfflineOrder[]> => {
  return await getDefaultItem<OfflineOrder[]>(OFFLINE_ORDERSTACK_NAME, []);
};

export const setOrders = async (orders: OfflineOrder[]) => {
  await localforage.setItem(OFFLINE_ORDERSTACK_NAME, orders);
};

const handleFormData = (order: OfflineOrder) => {
  if (!(order.body instanceof FormData)) {
    return order;
  }
  const result: OfflineOrder = { ...order };
  result.type = 'formdata';
  result.body = {};
  order.body.forEach((value, key) => {
    console.log('key: ', key);
    console.log('value: ', value);

    const name = (value as File).name;
    localforage.setItem(name, value);
    (result.body as { [key: string]: string })[key] = name;
  });
  return result;
};
