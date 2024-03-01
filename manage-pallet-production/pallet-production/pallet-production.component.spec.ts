import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalletProductionComponent } from '../../../shared/service/ManagePallet/pallet-production.component';

describe('PalletProductionComponent', () => {
  let component: PalletProductionComponent;
  let fixture: ComponentFixture<PalletProductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PalletProductionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PalletProductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
