import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgSpinnerWheelService } from './ng-spinner-wheel.service';
// import { NgSpinnerWheelService } from 'ng-spinner-wheel';

export interface MenuItems {
  menuTitle: string;
  Id?: string;
  menuWeight?: number;
  percentage?: number;
  backColor?: string;
  fontSize?: string;
  textColor?: string;
}

@Component({
  selector: 'lib-ng-spinner-wheel',
  standalone: true,
  imports: [],
  template: `
   <div id="wheel" class="ion-text-center">
      <div style="position: relative;">
        <canvas id="canvas" #canvas [width]="width" [height]="width"></canvas>

        <div>
          <img [style.height]="btnWidth+'px'" [style.width]="btnWidth+'px'" [style.top]="(width/2)-(btnWidth/2)+'px'"
            [style.left]="(width/2)-(btnWidth/2)+'px'" style="position: absolute;" (click)="startSpin()" src="https://i.postimg.cc/hj1XkSfG/spin.png" />
        </div>
      </div>
    </div>
  `,
  styles: ``
})
export class NgSpinnerWheelComponent implements OnChanges {
  private ctx!: CanvasRenderingContext2D | null;
  @ViewChild('canvas') canvasEl!: ElementRef;
  @Input("allItems") allItems: MenuItems[] = [];
  @Input("btnWidth") public btnWidth: number = 30;
  @Input("width") public width: number = 260;
  @Output() spinCompleted = new EventEmitter<MenuItems>();
  private center!: number;
  private deg: number = 0;
  private speed: number = 10;
  private isStopped: boolean = false;
  private lock: boolean = false;
  private isSpinning: boolean = false;
  private slowDownRand: number = 0;
  private canvas: any;
  private currentWinner: any;
  private fontSize = 15;
  private forceStop = false;

  constructor(public util: NgSpinnerWheelService) { }
  async ngAfterViewInit(): Promise<void> {
    this.regenerate();
  }

  public regenerate() {
    setTimeout(() => {
      this.onInIt2();
      this.loadDataInit();
      this.createSpinner();
    }, 1000);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allItems']) {
      this.regenerate();
    }
  }

  onInIt2() {
    this.canvas = this.canvasEl.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.width = this.canvas.width;
    this.center = this.width / 2;

  }

  async loadDataInit() {
    const totalWeight = this.allItems.reduce((sum: number, item: MenuItems) => sum + (item.menuWeight ?? 1), 0);
    await this.allItems.forEach((element: MenuItems) => {


      if (!element.menuWeight) element.menuWeight = 1;

      element.percentage = ((element.menuWeight / totalWeight) * 100)
      if (!element.backColor) {
        element.backColor = this.util.getRandomColor();
      }
      if (!element.textColor) {
        element.textColor = this.util.getTextColor(element.backColor);
      }

      if (!element.fontSize) {
        element.fontSize = "15px";
      }
    });

    this.allItems = this.shuffleArray(this.allItems);

    console.log(this.allItems);
  }

  startSpin() {
    if (this.lock || this.isStopped || this.isSpinning) {
      return;
    }
    const randomNumber = Math.floor(Math.random() * (8501 - 5000) + 5000);
    setTimeout(() => {
      this.stops();
    }, randomNumber);
    this.lock = false;
    this.forceStop = false;
    this.isStopped = false;
    this.isSpinning = true;
    this.spin();
  }

  spin() {


    let spin = () => {
      let slicesData = this.allItems;
      // const color = slicesData.map(slice => slice.color);
      const label = slicesData.map((slice: MenuItems) => slice.menuTitle);
      const slices = label.length;
      // const sliceDeg = 360 / slices;

      this.deg += this.speed;
      this.deg %= 360;

      if (this.forceStop) {
        this.lock = false;
        this.isStopped = false;
        this.isSpinning = false;
        this.speed = 0;
        return;
      }
      // Increment speed
      if (!this.isStopped && this.speed < 6) {
        this.speed = this.speed + 1 * 0.1;
      }

      // Decrement Speed
      if (this.isStopped) {
        if (!this.lock) {
          this.lock = true;
          this.slowDownRand = this.rand(0.990, 0.970);
        }
        this.speed = this.speed > 0.2 ? this.speed *= this.slowDownRand : 0;
      }



      if (this.lock && !this.speed) {
        this.lock = false;
        this.isStopped = false;
        this.isSpinning = false;

        // Determine winner based on final degree
        const finalDeg = (360 - this.deg + 270) % 360; // 270 is the top pointer
        let angleAccumulator = 0;
        for (let slice of slicesData) {

          const sliceAngle = (slice.percentage ?? 0) * 3.6;
          if (finalDeg >= angleAccumulator && finalDeg < angleAccumulator + sliceAngle) {
            this.currentWinner = slice;
            break;
          }
          angleAccumulator += sliceAngle;
        }
        this.spinCompleted.emit(this.currentWinner);
        // alert(this.currentWinner?.menu_title || 'No winner found!');
        return;
      }

      this.ctx?.clearRect(0, 0, this.width, this.width);
      this.currentWinner = null;
      let allTtl = this.deg;
      slicesData.forEach((slice: MenuItems, i: number) => {
        if (this.ctx) {
          this.ctx.beginPath();
          this.ctx.fillStyle = slice.backColor || "#000000"
          this.ctx.moveTo(this.center, this.center);
          this.ctx.arc(this.center, this.center, this.width / 2, this.deg2rad(this.deg), this.deg2rad(this.deg + ((slice.percentage ?? 0) * 3.6)));
          this.ctx.lineTo(this.center, this.center);
          this.ctx.fill();
          allTtl += ((slice.percentage ?? 0) * 3.6);
          const drawText_deg = this.deg + ((slice.percentage ?? 0) * 3.6) / 2;

          // console.log(this.deg,this.deg%360,slice.menu_title);
          if ((allTtl % 360) > 270 && !this.currentWinner) {
            this.currentWinner = slice;
          }

          this.ctx.save();
          this.ctx.translate(this.center, this.center);
          this.ctx.rotate(this.deg2rad(drawText_deg));
          this.ctx.textAlign = "right";
          this.ctx.fillStyle = slice.textColor || "#000000";;
          var textvalArr = this.toMultiLine(slice.menuTitle);
          var linespacing = 15;
          var startX = (this.width / 2) - 10;
          var startY = 5;

          for (var i = 0; i < textvalArr.length; i++) {
            this.ctx.fillText(textvalArr[i], startX, startY, (this.width / 2) - 20);
            startY += linespacing;
          }

          // this.ctx.font = 'bold ' + this.fontSize + 'px sans-serif';
          // this.ctx.fillText(slice.menu_title, 100, 5);
          this.ctx.restore();
          this.deg += ((slice.percentage ?? 0) * 3.6);
        }
      });

      window.requestAnimationFrame(() => spin());
    };
    spin();
    //window.requestAnimationFrame(spin);
  }
  stops() {
    if (!this.isSpinning || this.isStopped) {
      return;
    }
    this.isStopped = true;
  }

  deg2rad(deg: number): number {
    return deg * Math.PI / 180;
  }

  rand(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }



  setFontSize() {
    const baseFontSize = this.width / 20; // adjust divisor as needed

    const itemCount = this.allItems?.length || 0;

    if (itemCount <= 5) {
      this.fontSize = baseFontSize;
    } else if (itemCount <= 10) {
      this.fontSize = baseFontSize * 0.8;
    } else {
      this.fontSize = baseFontSize * 0.6;
    }
  }

  createSpinner() {
    this.setFontSize();
    let slicesData = this.allItems;
    const ctx = this.ctx;
    const width = this.width;
    const center = width / 2;

    if (ctx) {
      ctx.clearRect(0, 0, width, width);

      const totalDegrees = 360;
      let currentDegrees = 0;

      slicesData.forEach((slice: MenuItems) => {
        const name = slice.menuTitle;
        // const id = slice.id;
        const degree = (slice.percentage ?? 0) * 3.6;
        // const color = slice.color;
        // const { name, id, degree, color } = {1,1,1,1};

        ctx.beginPath();
        ctx.fillStyle = slice.backColor || "#000000";
        ctx.moveTo(center, center);
        ctx.arc(center, center, width / 2, this.deg2rad(currentDegrees), this.deg2rad(currentDegrees + degree));
        ctx.lineTo(center, center);
        ctx.fill();

        const drawText_deg = currentDegrees + degree / 2;
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(this.deg2rad(drawText_deg));
        ctx.textAlign = "right";
        ctx.fillStyle = slice.textColor || "#000000";;

        ctx.font = `bold ${slice.fontSize} sans-serif`;

        var textvalArr = this.toMultiLine(name);
        var linespacing = 15;
        var startX = (this.width / 2) - 5;
        var startY = 5;

        for (var i = 0; i < textvalArr.length; i++) {
          ctx.fillText(textvalArr[i], startX, startY, (this.width / 2) - 20);
          startY += linespacing;
        }
        ctx.restore();
        currentDegrees += degree;
      });
    }
  }
  toMultiLine(text: string) {
    var textArr = new Array();
    text = text.replace(/\n\r?/g, '<br/>');
    textArr = text.split("<br/>");
    return textArr;
  }


  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]; // copy to avoid mutating original array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
