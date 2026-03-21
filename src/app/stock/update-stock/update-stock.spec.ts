import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateStock } from './update-stock';

describe('UpdateStock', () => {
  let component: UpdateStock;
  let fixture: ComponentFixture<UpdateStock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateStock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateStock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
