import { HttpClient } from '@angular/common/http';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { map, Observable, of, switchMap, tap, timer } from 'rxjs';

export class JlgValidators {
  static integer(control: AbstractControl): ValidationErrors | null {
    const number = +control.value;
    if (isNaN(number) || Math.floor(number) !== number) {
      return { integer: { value: control.value } };
    }
    return null;
  }
}
