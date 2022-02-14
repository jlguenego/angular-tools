import { AbstractControl, ValidationErrors } from '@angular/forms';

export class JlgValidators {
  static integer(control: AbstractControl): ValidationErrors | null {
    const number = +control.value;
    if (isNaN(number) || Math.floor(number) !== number) {
      return { integer: { value: control.value } };
    }
    return null;
  }
}
