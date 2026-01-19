import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class OrderService extends HTTPService {
    override url = '/api/orders';

    search<T>(page: number, size: number, text?: string, status?: string, date?: string): Observable<T> {
        const params: any = { page, size };
        if (text) params.text = text;
        if (status) params.status = status;
        if (date) params.date = date;

        return this.http.get<T>(`${this.url}/search`, { params });
    }
}
