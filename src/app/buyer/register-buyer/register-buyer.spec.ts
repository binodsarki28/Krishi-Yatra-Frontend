import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterBuyer } from './register-buyer';

describe('RegisterBuyer', () => {
  let component: RegisterBuyer;
  let fixture: ComponentFixture<RegisterBuyer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterBuyer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterBuyer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
