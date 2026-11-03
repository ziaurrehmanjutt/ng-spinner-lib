import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { NgSpinnerWheelService } from './ng-spinner-wheel.service';

export interface MenuItems {
  menuTitle: string;
  /** Optional identifier (kept for backwards compatibility, prefer `id`). */
  Id?: string;
  id?: string;
  /** Relative weight of the slice. Defaults to 1. */
  menuWeight?: number;
  /** Computed by the wheel: share of the wheel in percent. */
  percentage?: number;
  /** Slice colour. A random colour is picked when omitted. */
  backColor?: string;
  /** CSS font size for the label, e.g. `'14px'`. Defaults to `'15px'`. */
  fontSize?: string;
  /** Label colour. Chosen for contrast with `backColor` when omitted. */
  textColor?: string;
}

/** Angle (in degrees, canvas coordinates) where the pointer sits: the top of the wheel. */
const POINTER_DEG = 270;
/** Speed is expressed in degrees per 60fps frame so the feel is independent of the display refresh rate. */
const FRAME_MS = 1000 / 60;
const MAX_SPEED = 6;
const ACCELERATION = 0.1;

@Component({
  selector: 'lib-ng-spinner-wheel',
  imports: [],
  template: `
    <div id="wheel" class="ion-text-center">
      <div style="position: relative;" [style.width.px]="width" [style.height.px]="width">
        <canvas #canvas [style.width.px]="width" [style.height.px]="width" role="img"
          aria-label="Spinner wheel"></canvas>

        <button type="button" aria-label="Spin the wheel" (click)="startSpin()"
          [style.height.px]="btnWidth" [style.width.px]="btnWidth"
          [style.top.px]="(width / 2) - (btnWidth / 2)" [style.left.px]="(width / 2) - (btnWidth / 2)"
          [style.font-size.px]="btnWidth * 0.3"
          style="position: absolute; padding: 0; border: 2px solid #fff; border-radius: 50%; cursor: pointer;
                 background: #333; color: #fff; font-weight: bold; line-height: 1; overflow: hidden;">
          @if (btnImage) {
            <img [src]="btnImage" alt="" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
          } @else {
            SPIN
          }
        </button>
      </div>
    </div>
  `,
  styles: ``
})
export class NgSpinnerWheelComponent implements OnChanges, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasEl!: ElementRef<HTMLCanvasElement>;

  /** Items on the wheel. Missing weight/colour/font size are filled in on the objects you pass. */
  @Input('allItems') allItems: MenuItems[] = [];
  /** Diameter of the spin button in pixels. */
  @Input('btnWidth') public btnWidth: number = 30;
  /** Diameter of the wheel in pixels. */
  @Input('width') public width: number = 260;
  /** Optional image URL for the centre button. A built-in "SPIN" button is used when omitted. */
  @Input() btnImage?: string;
  /** Shuffle the slice order whenever items change. Defaults to true. */
  @Input() shuffle: boolean = true;
  /** Minimum time in ms before the wheel starts slowing down. */
  @Input() minSpinTime: number = 5000;
  /** Maximum time in ms before the wheel starts slowing down. */
  @Input() maxSpinTime: number = 8500;
  /** Emits the winning item when the wheel stops. */
  @Output() spinCompleted = new EventEmitter<MenuItems>();

  private ctx: CanvasRenderingContext2D | null = null;
  private slices: MenuItems[] = [];
  private deg = 0;
  private speed = 0;
  private slowDownRate = 0.98;
  private isSpinning = false;
  private isStopping = false;
  private frameId: number | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;
  private lastFrameTime = 0;
  private viewReady = false;

  constructor(public util: NgSpinnerWheelService, private zone: NgZone) { }

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.regenerate();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.viewReady && (changes['allItems'] || changes['width'] || changes['shuffle'])) {
      this.regenerate();
    }
  }

  ngOnDestroy(): void {
    this.cancelAnimation();
  }

  /** Re-initialises the wheel from the current inputs. */
  public regenerate(): void {
    if (!this.viewReady) {
      return;
    }
    this.cancelAnimation();
    this.setupCanvas();
    this.prepareSlices();
    this.draw();
  }

  /** Starts spinning. It stops by itself after a random time and emits `spinCompleted`. */
  startSpin(): void {
    if (this.isSpinning || this.slices.length === 0) {
      return;
    }
    const min = Math.min(this.minSpinTime, this.maxSpinTime);
    const max = Math.max(this.minSpinTime, this.maxSpinTime);
    const duration = min + Math.random() * (max - min);

    this.isSpinning = true;
    this.isStopping = false;
    this.speed = MAX_SPEED / 2;
    this.lastFrameTime = 0;

    this.zone.runOutsideAngular(() => {
      this.stopTimer = setTimeout(() => this.stops(), duration);
      this.frameId = requestAnimationFrame(t => this.tick(t));
    });
  }

  /** Begins slowing the wheel down; it will land on a random slice. */
  stops(): void {
    if (!this.isSpinning || this.isStopping) {
      return;
    }
    this.isStopping = true;
    this.slowDownRate = this.rand(0.97, 0.99);
  }

  private tick(now: number): void {
    const frames = this.lastFrameTime ? Math.min((now - this.lastFrameTime) / FRAME_MS, 5) : 1;
    this.lastFrameTime = now;

    if (this.isStopping) {
      this.speed *= Math.pow(this.slowDownRate, frames);
    } else if (this.speed < MAX_SPEED) {
      this.speed = Math.min(MAX_SPEED, this.speed + ACCELERATION * frames);
    }

    if (this.isStopping && this.speed <= 0.2) {
      this.speed = 0;
      this.isSpinning = false;
      this.isStopping = false;
      this.frameId = null;
      this.draw();
      const winner = this.findWinner();
      this.zone.run(() => this.spinCompleted.emit(winner));
      return;
    }

    this.deg = (this.deg + this.speed * frames) % 360;
    this.draw();
    this.frameId = requestAnimationFrame(t => this.tick(t));
  }

  private cancelAnimation(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    if (this.stopTimer !== null) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    this.isSpinning = false;
    this.isStopping = false;
    this.speed = 0;
  }

  private setupCanvas(): void {
    const canvas = this.canvasEl.nativeElement;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = this.width * ratio;
    canvas.height = this.width * ratio;
    this.ctx = canvas.getContext('2d');
    this.ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  private prepareSlices(): void {
    const items = this.allItems ?? [];
    const totalWeight = items.reduce((sum, item) => sum + (item.menuWeight || 1), 0);

    for (const item of items) {
      item.menuWeight = item.menuWeight || 1;
      item.percentage = (item.menuWeight / totalWeight) * 100;
      item.backColor ||= this.util.getRandomColor();
      item.textColor ||= this.util.getTextColor(item.backColor);
      item.fontSize ||= '15px';
    }

    this.slices = this.shuffle ? this.shuffleArray(items) : [...items];
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    const size = this.width;
    const center = size / 2;
    ctx.clearRect(0, 0, size, size);

    let start = this.deg;
    for (const slice of this.slices) {
      const angle = (slice.percentage ?? 0) * 3.6;

      ctx.beginPath();
      ctx.fillStyle = slice.backColor || '#000000';
      ctx.moveTo(center, center);
      ctx.arc(center, center, center, this.deg2rad(start), this.deg2rad(start + angle));
      ctx.lineTo(center, center);
      ctx.fill();

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(this.deg2rad(start + angle / 2));
      ctx.textAlign = 'right';
      ctx.fillStyle = slice.textColor || '#000000';
      ctx.font = `bold ${slice.fontSize || '15px'} sans-serif`;
      let y = 5;
      for (const line of this.toMultiLine(slice.menuTitle)) {
        ctx.fillText(line, center - 10, y, center - 20);
        y += 15;
      }
      ctx.restore();

      start += angle;
    }
  }

  private findWinner(): MenuItems {
    const pointerAngle = (((POINTER_DEG - this.deg) % 360) + 360) % 360;
    let accumulated = 0;
    for (const slice of this.slices) {
      accumulated += (slice.percentage ?? 0) * 3.6;
      if (pointerAngle < accumulated) {
        return slice;
      }
    }
    return this.slices[this.slices.length - 1];
  }

  deg2rad(deg: number): number {
    return deg * Math.PI / 180;
  }

  rand(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  toMultiLine(text: string): string[] {
    return (text ?? '').split(/\r?\n|\n\r/);
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
