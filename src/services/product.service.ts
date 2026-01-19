import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductsResponse, CategoryProduct } from '../models/product.model';
import { HTTPService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends HTTPService {
  override url = '/api/products';

  getCategoryBySlug(slug: string): Observable<CategoryProduct> {
    return this.http.get<CategoryProduct>(`/api/category-products/${slug}`);
  }

  getAllCategories(): Observable<CategoryProduct[]> {
    return this.http.get<CategoryProduct[]>('/api/category-products/all');
  }

  search<T>(page: number, size: number, text?: string, category?: string): Observable<T> {
    const params: any = { page, size };
    if (text) params.text = text;
    if (category) params.category = category;

    return this.http.get<T>(`${this.url}/search`, { params });
  }
}
