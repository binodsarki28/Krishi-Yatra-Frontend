import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnStockList } from './own-stock-list';

describe('OwnStockList', () => {
  let component: OwnStockList;
  let fixture: ComponentFixture<OwnStockList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnStockList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnStockList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
