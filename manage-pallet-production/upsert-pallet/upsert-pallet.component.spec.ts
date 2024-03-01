import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpsertPalletComponent } from './upsert-pallet.component';

describe('UpsertPalletComponent', () => {
  let component: UpsertPalletComponent;
  let fixture: ComponentFixture<UpsertPalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpsertPalletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpsertPalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
