import { Injectable } from '@angular/core';

const matchValue = (value: string, match: string) => {
  const lmatch = match.toLowerCase();
  const lvalue = value.toLowerCase();
  let result = '';
  let i = 0;
  for (const c of lvalue) {
    if (i < lmatch.length && c === lmatch[i]) {
      i++;
    }
  }
  return i === match.length;
};

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor() {}

  match(pattern: string, document: object) {
    const p = pattern.toLowerCase();
    for (const [key, value] of Object.entries(document)) {
      if (key === 'id') {
        continue;
      }
      if (typeof value !== 'string') {
        continue;
      }
      if (matchValue(value.toLowerCase(), p)) {
        return true;
      }
    }
    return false;
  }
}
