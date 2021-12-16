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
        tap(() => {
          console.log(
            'debounce fini. je lance vraiment la requete de test duplicate'
          );
        }),
        switchMap(() => this.http.get<unknown[]>(makeUrl(control.value))),
        map((resources) => {
          console.log('resources: ', resources);
          if (resources.length > 0) {
            return { duplicate: { value: control.value } };
          }
          return null;
        })
      );
    };
  }
}
