import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HTTPService } from './http.service';
import {
  DailyIncomeResponse,
  DailyBookingsResponse,
  ActiveBookingsResponse,
  DailySummaryItem,
  ChartDataResponse
} from '../models/stats.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService extends HTTPService {
  private readonly baseUrl = '/api/stats';


  getDailyIncome(): Observable<DailyIncomeResponse> {
    return this.http.get<DailyIncomeResponse>(`${this.baseUrl}/daily-income`);
  }

  getDailyBookings(): Observable<DailyBookingsResponse> {
    return this.http.get<DailyBookingsResponse>(`${this.baseUrl}/daily-bookings`);
  }

  getActiveBookings(): Observable<ActiveBookingsResponse> {
    return this.http.get<ActiveBookingsResponse>(`${this.baseUrl}/active-bookings`);
  }

  getDailySummary(): Observable<DailySummaryItem[]> {
    return this.http.get<DailySummaryItem[]>(`${this.baseUrl}/daily-summary`);
  }

  getMonthlyIncome(): Observable<ChartDataResponse> {
    return this.http.get<ChartDataResponse>(`${this.baseUrl}/monthly-income`);
  }

  getMonthlyUsers(): Observable<ChartDataResponse> {
    return this.http.get<ChartDataResponse>(`${this.baseUrl}/monthly-users`);
  }

  getMonthlyReports(): Observable<ChartDataResponse> {
    return this.http.get<ChartDataResponse>(`${this.baseUrl}/monthly-reports`);
  }

  getIncomeVsCosts(): Observable<ChartDataResponse> {
    return this.http.get<ChartDataResponse>(`${this.baseUrl}/income-vs-costs`);
  }
}
