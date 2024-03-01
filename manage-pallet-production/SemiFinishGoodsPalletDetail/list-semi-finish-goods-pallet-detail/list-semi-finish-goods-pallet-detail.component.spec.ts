import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSemiFinishGoodsPalletDetailComponent } from './list-semi-finish-goods-pallet-detail.component';

describe('ListSemiFinishGoodsPalletDetailComponent', () => {
  let component: ListSemiFinishGoodsPalletDetailComponent;
  let fixture: ComponentFixture<ListSemiFinishGoodsPalletDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListSemiFinishGoodsPalletDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSemiFinishGoodsPalletDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
