import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSubCategory } from './manage-sub-category';

describe('ManageSubCategory', () => {
  let component: ManageSubCategory;
  let fixture: ComponentFixture<ManageSubCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSubCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSubCategory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
