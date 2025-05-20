 #### ng-spinner-wheel
A lightweight, customizable standalone Angular spinner wheel component.

---

## 📦 Installation

### Install from npm (once published):
```
npm install ng-spinner-wheel
```
---
## 🧩 How to Use

### In your parent component:

```typescript
import { Component, ViewChild } from '@angular/core';
import { NgSpinnerWheelComponent } from 'ng-spinner-wheel';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgSpinnerWheelComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  allItems = [
    { label: 'Item 1', value: 1 },
    { label: 'Item 2', value: 2 }
  ];

  @ViewChild('spinner') spinnerRef!: NgSpinnerWheelComponent;

  updateItems() {
    this.allItems = [...this.allItems, { label: 'Item 3', value: 3 }];
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
```
<lib-ng-spinner-wheel
  #spinner
  [btnWidth]="60"
  [allItems]="allItems"
  (spinCompleted)="handleSpinCompleted($event)">
</lib-ng-spinner-wheel>

<button (click)="updateItems()">Update Spinner</button>
```

###  🔧 Inputs

```
allItems: MenuItems[] – Array of objects to spin
btnWidth: number – Width of the spin button in pixels

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
```
spinCompleted: EventEmitter<MenuItems> – Emits the selected item when spin completes
```
### 🛠️ Public Methods
```
regenerate() – Re-initializes the spinner based on current inputs
```
