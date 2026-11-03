import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuItems, NgSpinnerWheelComponent } from './ng-spinner-wheel.component';

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

  it('fills in defaults and percentages for items', () => {
    const items: MenuItems[] = [{ menuTitle: 'A' }, { menuTitle: 'B', menuWeight: 3 }];
    component.allItems = items;
    component.regenerate();

    expect(items[0].percentage).toBe(25);
    expect(items[1].percentage).toBe(75);
    expect(items[0].backColor).toBeTruthy();
    expect(items[0].textColor).toBeTruthy();
    expect(items[0].fontSize).toBe('15px');
  });

  it('emits one of the items when the spin completes', done => {
    const items: MenuItems[] = [{ menuTitle: 'A' }, { menuTitle: 'B' }, { menuTitle: 'C' }];
    component.allItems = items;
    component.minSpinTime = 10;
    component.maxSpinTime = 10;
    component.regenerate();

    component.spinCompleted.subscribe((winner: MenuItems) => {
      expect(items).toContain(winner);
      done();
    });
    component.startSpin();
  }, 20000);

  it('does nothing when there are no items', () => {
    component.allItems = [];
    component.regenerate();
    expect(() => component.startSpin()).not.toThrow();
  });
});
