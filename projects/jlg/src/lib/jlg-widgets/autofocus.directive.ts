import {
  AfterContentInit,
  Directive,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';

@Directive({
  selector: '[jlgAutofocus]',
})
export class AutofocusDirective implements AfterContentInit {
  @Input() jlgAutofocus: 'select' | '' = '';
  constructor(private elt: ElementRef<HTMLInputElement>) {
    console.log('jlg autofocus');
  }
  ngAfterContentInit(): void {
    if (this.jlgAutofocus === 'select') {
      this.elt.nativeElement.select();
      return;
    }
    this.elt.nativeElement.focus();
  }
}
