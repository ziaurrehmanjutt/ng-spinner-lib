import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MenuItems, NgSpinnerWheelComponent } from 'ng-spinner-wheel';

@Component({
  imports: [NgSpinnerWheelComponent, FormsModule],
  selector: 'app-root',
  styles: `
    :host { display: block; max-width: 960px; margin: 0 auto; padding: 24px 16px 48px; }
    h1 { margin: 0 0 4px; }
    .sub { color: #666; margin: 0 0 24px; }
    .grid { display: grid; grid-template-columns: auto 1fr; gap: 32px; align-items: start; }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
    .stage { position: relative; display: inline-block; }
    .pointer { position: absolute; left: 50%; top: -10px; transform: translateX(-50%);
      border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 22px solid #222; z-index: 2; }
    .result { margin-top: 16px; font-size: 1.2rem; min-height: 1.6em; }
    .panel { background: #f6f6f8; border-radius: 12px; padding: 16px; }
    .row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
    .row input[type=text] { flex: 1; min-width: 0; }
    .row input[type=number] { width: 64px; }
    label { display: block; margin: 8px 0; }
    button.small { cursor: pointer; }
    pre { background: #1e1e2e; color: #eee; padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    a { color: #4f46e5; }
  `,
  template: `
    <h1>ng-spinner-wheel</h1>
    <p class="sub">Weighted spinner wheel for Angular.
      <a href="https://www.npmjs.com/package/ng-spinner-wheel" target="_blank" rel="noopener">npm</a> ·
      <a href="https://github.com/ziaurrehmanjutt/ng-spinner-lib" target="_blank" rel="noopener">GitHub</a></p>

    <div class="grid">
      <div>
        <div class="stage">
          <div class="pointer"></div>
          <lib-ng-spinner-wheel [allItems]="items()" [width]="width()" [btnWidth]="btnWidth()"
            [shuffle]="shuffle()" (spinCompleted)="winner.set($event)" />
        </div>
        <div class="result">
          @if (winner(); as w) { 🎉 Winner: <strong>{{ w.menuTitle }}</strong> } @else { Press SPIN }
        </div>
      </div>

      <div class="panel">
        <h3 style="margin-top:0">Items (weight = chance)</h3>
        @for (item of items(); track item) {
          <div class="row">
            <input type="text" [(ngModel)]="item.menuTitle" (change)="refresh()" aria-label="Title" />
            <input type="number" min="1" [(ngModel)]="item.menuWeight" (change)="refresh()" aria-label="Weight" />
            <button class="small" (click)="remove(item)" [disabled]="items().length <= 2">✕</button>
          </div>
        }
        <button class="small" (click)="add()">+ Add item</button>

        <label>Wheel size: {{ width() }}px
          <input type="range" min="200" max="420" [value]="width()" (input)="width.set(+$any($event.target).value)" /></label>
        <label>Button size: {{ btnWidth() }}px
          <input type="range" min="30" max="100" [value]="btnWidth()" (input)="btnWidth.set(+$any($event.target).value)" /></label>
        <label><input type="checkbox" [checked]="shuffle()" (change)="shuffle.set(!shuffle())" /> Shuffle slices</label>
      </div>
    </div>

    <h3>Usage</h3>
    <pre>npm install ng-spinner-wheel</pre>
    <pre>{{ usage }}</pre>
  `,
})
export class App {
  protected items = signal<MenuItems[]>([
    { menuTitle: 'Gold', menuWeight: 1 },
    { menuTitle: 'Silver', menuWeight: 2 },
    { menuTitle: 'Bronze', menuWeight: 3 },
    { menuTitle: 'Try again', menuWeight: 4 },
  ]);
  protected width = signal(300);
  protected btnWidth = signal(60);
  protected shuffle = signal(false);
  protected winner = signal<MenuItems | null>(null);

  protected usage = `import { NgSpinnerWheelComponent, MenuItems } from 'ng-spinner-wheel';

@Component({ imports: [NgSpinnerWheelComponent], ... })
export class Demo {
  items: MenuItems[] = [{ menuTitle: 'Gold' }, { menuTitle: 'Silver', menuWeight: 2 }];
  onDone(item: MenuItems) { console.log(item); }
}

<lib-ng-spinner-wheel [allItems]="items" (spinCompleted)="onDone($event)" />`;

  /** The wheel redraws on a new array reference. */
  protected refresh() { this.items.update(i => [...i]); }
  protected add() { this.items.update(i => [...i, { menuTitle: `Item ${i.length + 1}`, menuWeight: 1 }]); }
  protected remove(item: MenuItems) { this.items.update(i => i.filter(x => x !== item)); }
}
