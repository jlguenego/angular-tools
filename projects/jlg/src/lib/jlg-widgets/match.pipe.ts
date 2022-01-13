import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'match',
})
export class MatchPipe implements PipeTransform {
  transform(value: string, match: string): string {
    const lmatch = match.toLowerCase();
    const lvalue = value.toLowerCase();
    let result = '';
    let i = 0;
    for (const c of lvalue) {
      if (i < lmatch.length && c === lmatch[i]) {
        result += `<b>${c}</b>`;
        i++;
      } else {
        result += c;
      }
    }
    return `<span class="match">${result}</span>`;
  }
}
