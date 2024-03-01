import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListBomComponent } from './list-bom.component';

describe('ListBomComponent', () => {
  let component: ListBomComponent;
  let fixture: ComponentFixture<ListBomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListBomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListBomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
