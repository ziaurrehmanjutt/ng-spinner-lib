import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgSpinnerWheelComponent } from './ng-spinner-wheel.component';

describe('NgSpinnerWheelComponent', () => {
  let component: NgSpinnerWheelComponent;
  let fixture: ComponentFixture<NgSpinnerWheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgSpinnerWheelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgSpinnerWheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
