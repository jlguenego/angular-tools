import { removeDiacritics } from './../misc/diacritics';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'match',
})
export class MatchPipe implements PipeTransform {
  transform(value: string, match: string): string {
    const lmatch = removeDiacritics(match.toLowerCase());
    const lvalue = removeDiacritics(value.toLowerCase());
    let result = '';
    let i = 0;
    for (let j = 0; j < lvalue.length; j++) {
      const c = lvalue[j];
      if (i < lmatch.length && c === lmatch[i]) {
        result += `<b>${value[j]}</b>`;
        i++;
      } else {
        result += value[j];
      }
    }
    return `<span class="match">${result}</span>`;
  }
}
