import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NgSpinnerWheelService {

  constructor() { }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  items: any = [];

  addItemFoePool(item: any, weight: number): void {
    if (weight > 0) {
      this.items.push({ item, weight });
    } else {
      throw new Error("Weight must be greater than 0");
    }
  }

  selectRandomItem() {
    const totalWeight = this.items.reduce((sum: number, item: any) => sum + item.weight, 0);

    if (totalWeight === 0) {
      return null; // No items in the pool
    }

    let randomValue = Math.random() * totalWeight;
    let accumulatedWeight = 0;

    for (const { item, weight } of this.items) {
      accumulatedWeight += weight;
      if (randomValue <= accumulatedWeight) {
        return item;
      }
    }

    return null; // Shouldn't reach here, but just in case
  }



  getTextColor(backgroundHexColor: string): string {
    const hex = backgroundHexColor.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

}
