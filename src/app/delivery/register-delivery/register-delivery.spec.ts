import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDelivery } from './register-delivery';

describe('RegisterDelivery', () => {
  let component: RegisterDelivery;
  let fixture: ComponentFixture<RegisterDelivery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterDelivery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterDelivery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
