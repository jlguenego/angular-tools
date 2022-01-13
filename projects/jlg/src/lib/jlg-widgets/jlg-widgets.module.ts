import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AutofocusDirective } from './autofocus.directive';
import { MatchPipe } from './match.pipe';

@NgModule({
  declarations: [AutofocusDirective, MatchPipe],
  imports: [CommonModule],
  exports: [AutofocusDirective, MatchPipe],
})
export class JlgWidgetsModule {}
