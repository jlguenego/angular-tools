import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JlgComponent } from './jlg.component';

describe('JlgComponent', () => {
  let component: JlgComponent;
  let fixture: ComponentFixture<JlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
