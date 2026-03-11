import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalToast } from './global-toast';

describe('GlobalToast', () => {
  let component: GlobalToast;
  let fixture: ComponentFixture<GlobalToast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalToast]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalToast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
