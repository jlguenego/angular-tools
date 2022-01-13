import { Injectable } from '@angular/core';

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
      if (value.match(new RegExp(p, 'i'))) {
        return true;
      }
    }
    return false;
  }
}
