import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBomComponent } from './create-bom.component';

describe('CreateBomComponent', () => {
  let component: CreateBomComponent;
  let fixture: ComponentFixture<CreateBomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateBomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
