import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from '@angular/forms';
import { map, Observable, of, switchMap, tap, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DuplicateAsyncValidator {
  constructor(private http: HttpClient) {}
  validate(makeUrl: (val: string) => string) {
    return (
      control: AbstractControl
    ):
      | Promise<ValidationErrors | null>
      | Observable<ValidationErrors | null> => {
      console.log('start to async validate', control.value);
      if (!control.value) {
        return of(null);
      }
      return timer(1000).pipe(
        switchMap(() =>
          this.http.get<unknown[]>(makeUrl(control.value), {
            headers: {
              'Cache-Control': 'no-store',
            },
          })
        ),
        map((resources) => {
          if (resources.length > 0) {
            return { duplicate: { value: control.value } };
          }
          return null;
        })
      );
    };
  }
}
