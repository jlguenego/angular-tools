import {
  AfterContentInit,
  Directive,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';

const isSmartphone = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

@Directive({
  selector: '[jlgAutofocus]',
})
export class AutofocusDirective implements AfterContentInit {
  @Input() jlgAutofocus: 'select' | '' = '';
  constructor(private elt: ElementRef<HTMLInputElement>) {
    console.log('jlg autofocus');
  }
  ngAfterContentInit(): void {
    if (isSmartphone()) {
      return;
    }
    if (this.jlgAutofocus === 'select') {
      this.elt.nativeElement.select();
      return;
    }
    this.elt.nativeElement.focus();
  }
}
