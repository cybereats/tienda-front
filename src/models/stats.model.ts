export interface DailyIncomeResponse {
  total: number;
}

export interface DailyBookingsResponse {
  count: number;
}

export interface ActiveBookingsResponse {
  total: number;
  occupied: number;
}

export interface DailySummaryItem {
  hour: number;
  income: number;
}

export interface ChartDataResponse {
  series: SeriesData[];
  categories: string[];
  colors: string[];
}

export interface SeriesData {
  name: string;
  data: number[];
}
