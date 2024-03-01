import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewBOmComponent } from './view-bom.component';

describe('ViewBOmComponent', () => {
  let component: ViewBOmComponent;
  let fixture: ComponentFixture<ViewBOmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewBOmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewBOmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
