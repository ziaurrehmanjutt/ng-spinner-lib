import { TestBed } from '@angular/core/testing';

import { NgSpinnerWheelService } from './ng-spinner-wheel.service';

describe('NgSpinnerWheelService', () => {
  let service: NgSpinnerWheelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgSpinnerWheelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
