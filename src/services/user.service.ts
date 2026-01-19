import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductsResponse } from '../models/product.model';
import { HTTPService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class UserService extends HTTPService {
    override url = '/api/users';

    search<T>(page: number, size: number, text?: string, role?: string): Observable<T> {
        const params: any = { page, size };
        if (text) params.text = text;
        if (role) params.role = role;

        return this.http.get<T>(`${this.url}/search`, { params });
    }
}