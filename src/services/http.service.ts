import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})

export class HTTPService {
  url!: string;

  http = inject(HttpClient);
  getAll<T>(page: number, size: number): Observable<T> {
    return this.http.get<T>(this.url, { params: { page, size } });
  }
  findById<T>(id: string): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }
  post<T>(data: T): Observable<T> {
    return this.http.post<T>(this.url, data);
  }
  put<T>(id: string, data: T): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, data);
  }
  delete<T>(id: string): Observable<T> {
    return this.http.delete<T>(`${this.url}/${id}`);
  }
}