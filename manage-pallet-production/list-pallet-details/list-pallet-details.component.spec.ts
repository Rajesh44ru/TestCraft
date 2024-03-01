import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPalletDetailsComponent } from './list-pallet-details.component';

describe('ListPalletDetailsComponent', () => {
  let component: ListPalletDetailsComponent;
  let fixture: ComponentFixture<ListPalletDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPalletDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPalletDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
