# ng-spinner-wheel

A lightweight, customizable standalone Angular spinner wheel with weighted items. Good for raffles, lucky draws, prize wheels and gamified selections (works in Ionic too).

- Standalone component, no NgModule needed
- Weighted slices: heavier items get a bigger slice and a higher chance of winning
- Canvas based, sharp on high-DPI screens, no external assets
- Works with Angular 18 – 22

## Installation

```bash
npm install ng-spinner-wheel
```

## Usage

```typescript
import { Component, ViewChild } from '@angular/core';
import { MenuItems, NgSpinnerWheelComponent } from 'ng-spinner-wheel';

@Component({
  selector: 'app-root',
  imports: [NgSpinnerWheelComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  allItems: MenuItems[] = [
    { menuTitle: 'Gold' },
    { menuTitle: 'Dark', menuWeight: 2, id: 'ABC' },
    { menuTitle: 'Silver', menuWeight: 2, backColor: '#C0C0C0', textColor: '#FFFFFF', fontSize: '12px' },
  ];

  @ViewChild('spinner') spinner!: NgSpinnerWheelComponent;

  addItem() {
    this.allItems = [...this.allItems, { menuTitle: 'Item 3', menuWeight: 6 }];
  }

  onSpinCompleted(item: MenuItems) {
    console.log('Winner:', item);
  }
}
```

```html
<lib-ng-spinner-wheel
  #spinner
  [allItems]="allItems"
  [width]="300"
  [btnWidth]="60"
  (spinCompleted)="onSpinCompleted($event)">
</lib-ng-spinner-wheel>

<button (click)="addItem()">Add item</button>
```

The wheel redraws automatically when you pass a new `allItems` array (or change `width`). It does **not** detect in-place changes such as `allItems.push(...)`; assign a new array, or call `spinner.regenerate()`.

The pointer is the top of the wheel; place your own marker there.

## Inputs

| Input         | Type          | Default | Description |
|---------------|---------------|---------|-------------|
| `allItems`    | `MenuItems[]` | `[]`    | Items on the wheel. |
| `width`       | `number`      | `260`   | Wheel diameter in px. |
| `btnWidth`    | `number`      | `30`    | Spin button diameter in px. |
| `btnImage`    | `string`      | –       | Image URL for the spin button. A built-in "SPIN" button is used if omitted. |
| `shuffle`     | `boolean`     | `true`  | Shuffle slice order when items change. |
| `minSpinTime` | `number`      | `5000`  | Minimum ms before the wheel starts slowing down. |
| `maxSpinTime` | `number`      | `8500`  | Maximum ms before the wheel starts slowing down. |

### `MenuItems`

```typescript
interface MenuItems {
  menuTitle: string;     // label; use \n for multiple lines
  id?: string;           // your own identifier (`Id` is also accepted)
  menuWeight?: number;   // relative weight, default 1
  backColor?: string;    // slice colour, random if omitted
  textColor?: string;    // label colour, auto-contrast if omitted
  fontSize?: string;     // e.g. '14px', default '15px'
  percentage?: number;   // computed by the wheel
}
```

Missing `menuWeight`, `backColor`, `textColor`, `fontSize` and the computed `percentage` are filled in on the objects you pass in.

## Outputs

| Output          | Payload     | Description |
|-----------------|-------------|-------------|
| `spinCompleted` | `MenuItems` | The winning item, emitted when the wheel stops. |

## Public methods

| Method         | Description |
|----------------|-------------|
| `startSpin()`  | Start spinning programmatically (same as clicking the button). |
| `stops()`      | Start slowing the wheel down early. |
| `regenerate()` | Re-initialise the wheel from the current inputs. |

## Upgrading from 1.x

- Requires Angular 18+; built with Angular 22.
- The spin button no longer loads an image from an external host; it is now a real `<button>`. Use `btnImage` for a custom look.
- The wheel no longer logs to the console and draws immediately instead of after a 1 second delay.
- `id` is now accepted on `MenuItems` (as documented); `Id` still works.

## License

MIT
