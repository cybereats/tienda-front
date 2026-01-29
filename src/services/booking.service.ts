import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HTTPService } from './http.service';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService extends HTTPService {
  override url = '/api/bookings';

  getMyActiveBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.url}/my-active`);
  }
}
