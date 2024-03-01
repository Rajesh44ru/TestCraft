import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BOMApprovalComponent } from './bomapproval.component';

describe('BOMApprovalComponent', () => {
  let component: BOMApprovalComponent;
  let fixture: ComponentFixture<BOMApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BOMApprovalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BOMApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
