import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertSemiFinishGoodsPalletDetailComponent } from './upsert-semi-finish-goods-pallet-detail.component';

describe('UpsertSemiFinishGoodsPalletDetailComponent', () => {
  let component: UpsertSemiFinishGoodsPalletDetailComponent;
  let fixture: ComponentFixture<UpsertSemiFinishGoodsPalletDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertSemiFinishGoodsPalletDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpsertSemiFinishGoodsPalletDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
