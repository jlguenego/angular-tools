import {
  BlackAndWhiteList,
  Specifier,
  SpecifierObject,
} from '../interfaces/black-and-white-list';

function whiteListFilter(value: string, whiteList: Specifier[] | undefined) {
  if (!whiteList) {
    return true;
  }
  for (const specifier of whiteList) {
    if (typeof specifier === 'string') {
      if (value === specifier) {
        return true;
      }
    }

    const specifierObject = specifier as SpecifierObject;

    if (specifierObject.type === 'regexp') {
      if (value.match(specifierObject.path)) {
        return true;
      }
    }
  }
  return false;
}

function blackListFilter(value: string, blackList: Specifier[] | undefined) {
  if (!blackList) {
    return true;
  }
  for (const specifier of blackList) {
    if (typeof specifier === 'string') {
      if (value === specifier) {
        return false;
      }
    }

    const specifierObject = specifier as SpecifierObject;

    if (specifierObject.type === 'regexp') {
      if (value.match(specifierObject.path)) {
        return false;
      }
    }
  }
  return true;
}

export const blackAndWhiteFilter = (
  value: string,
  bwList: BlackAndWhiteList
): boolean => {
  return (
    whiteListFilter(value, bwList.whiteList) &&
    blackListFilter(value, bwList.blackList)
  );
};

export const doNotAllowAnythingConfig: BlackAndWhiteList = { whiteList: [] };
export const allowEverythingConfig: BlackAndWhiteList = {};
