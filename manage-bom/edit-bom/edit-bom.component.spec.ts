import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBomComponent } from './edit-bom.component';

describe('EditBomComponent', () => {
  let component: EditBomComponent;
  let fixture: ComponentFixture<EditBomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditBomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
