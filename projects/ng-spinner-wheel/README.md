 #### Angular Spinner Wheel
 #### IONIC Spinner Wheel
A lightweight, customizable standalone Angular spinner wheel component.

---

## 📦 Installation

### Install from npm:
```bash
npm install ng-spinner-wheel
```
---
## 🧩 How to Use

### In your parent component:

```typescript
import { Component, ViewChild } from '@angular/core';
import { MenuItems, NgSpinnerWheelComponent } from 'ng-spinner-wheel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgSpinnerWheelComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
 allItems:MenuItems[] = [
    { menuTitle: 'Gold'},
    { menuTitle: 'Dark' , menuWeight:2 , id:"ABC"},
    { menuTitle: 'Silver', menuWeight: 2, backColor: '#C0C0C0', textColor: '#FFFFFF', fontSize: '12px' },
];

 @ViewChild('spinner') spinnerRef!: NgSpinnerWheelComponent;

  updateItems() {
    this.allItems = [...this.allItems, { menuTitle: 'Item 3', menuWeight: 6 }];
    setTimeout(() => {
      this.spinnerRef.regenerate();
    });
  }

  handleSpinCompleted(item: any) {
    console.log('Spin result:', item);
  }
}  
```
###  In your template:
```html
<lib-ng-spinner-wheel
  #spinner
  [btnWidth]="60"
  [allItems]="allItems"
  (spinCompleted)="handleSpinCompleted($event)">
</lib-ng-spinner-wheel>

<button (click)="updateItems()">Update Spinner</button>
```

###  🔧 Inputs

```typescript
allItems: MenuItems[] – Array of objects to spin
btnWidth: number – Width of the spin button in pixels
width: number - Width of the Spinner wheel


MenuItems {
  menuTitle: string;
  Id?: string;
  menuWeight?: number;
  percentage?: number;
  backColor?: string;
  fontSize?: string;
  textColor?: string;
}
```
### 📢 Output Events
```typescript
spinCompleted: EventEmitter<MenuItems> – Emits the selected item when spin completes
```
### 🛠️ Public Methods
```typescript
regenerate() – Re-initializes the spinner based on current inputs
```
