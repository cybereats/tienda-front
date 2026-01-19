import { Component, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexStroke,
  ApexFill,
  ApexDataLabels,
  ApexTooltip
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  fill: ApexFill;
  dataLabels: ApexDataLabels;
  colors: string[];
  tooltip?: ApexTooltip;
};

export type ChartType = "bar" | "area" | "line";

@Component({
  selector: 'c-graphic',
  imports: [ChartComponent],
  templateUrl: './c-graphic.html',
  styleUrl: './c-graphic.scss',
})
export class CGraphic implements OnChanges {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: ChartOptions;

  @Input() series: ApexAxisChartSeries = [];
  @Input() categories: string[] = [];
  @Input() colors: string[] = ["#7600A8"];
  @Input() height: string = "100%";
  @Input() type: ChartType = "bar";
  @Input() curve: "smooth" | "straight" = "smooth";
  @Input() showDataLabels: boolean = true;
  @Input() showToolbar: boolean = true;

  constructor() {
    this.chartOptions = {
      series: [],
      colors: [],
      chart: {
        height: "100%",
        width: "100%",
        type: "bar",
        toolbar: {
          show: true
        }
      },
      title: {
        text: ""
      },
      fill: {
        colors: []
      },
      stroke: {
        curve: "smooth",
        colors: []
      },
      dataLabels: {
        enabled: true
      },
      xaxis: {
        type: "category",
        categories: []
      }
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.chartOptions = {
      ...this.chartOptions,
      series: this.series,
      colors: this.colors,
      fill: {
        colors: this.colors
      },
      stroke: {
        curve: this.curve,
        colors: this.colors
      },
      dataLabels: {
        enabled: this.showDataLabels
      },
      xaxis: {
        ...this.chartOptions.xaxis,
        categories: this.categories
      },
      chart: {
        ...this.chartOptions.chart,
        height: this.height,
        type: this.type,
        toolbar: {
          show: this.showToolbar
        }
      }
    };
  }
}