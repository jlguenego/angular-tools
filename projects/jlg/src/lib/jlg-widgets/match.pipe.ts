import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'match',
})
export class MatchPipe implements PipeTransform {
  transform(value: string, match: string): string {
    let result = '';
    let i = 0;
    for (const c of value) {
      if (i < match.length && c === match[i]) {
        result += `<b>${c}</b>`;
        i++;
      } else {
        result += c;
      }
    }
    return `<span class="match">${result}</span>`;
  }
}
