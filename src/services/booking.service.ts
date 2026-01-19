import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService extends HTTPService {
  override url = '/api/bookings';
}
