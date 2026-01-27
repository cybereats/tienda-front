import { Injectable } from '@angular/core';
import { HTTPService } from './http.service';
import { Observable } from 'rxjs';
import { CategoryPC } from '../models/computer.model';

@Injectable({
    providedIn: 'root'
})
export class ComputerService extends HTTPService {
    override url = '/api/pcs';

    getCategoryBySlug(slug: string): Observable<CategoryPC> {
        return this.http.get<CategoryPC>(`/api/categories-pc/${slug}`);
    }

    findAllPage<T>(page: number, size: number): Observable<T> {
        return this.http.get<T>(`${this.url}?page=${page}&size=${size}`);
    }

    findAll<T>(): Observable<T> {
        return this.http.get<T>(`${this.url}/all`);
    }

    search<T>(page: number, size: number, text?: string, category?: string): Observable<T> {
        const params: any = { page, size };
        if (text) params.text = text;
        if (category) params.category = category;

        return this.http.get<T>(`${this.url}/search`, { params });
    }

    getAllCategories(): Observable<CategoryPC[]> {
        return this.http.get<CategoryPC[]>('/api/categories-pc/all');
    }
}