import * as localforage from 'localforage';

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

export const isOfflineError = (err: unknown) => {
  console.log('isOfflineError err: ', err);
  return true;
};
