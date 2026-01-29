import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';
import { UserOrder } from './user-order.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private url = '/api/cart';

  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0
  });

  cart$ = this.cartSubject.asObservable();

  get cart(): Cart {
    return this.cartSubject.getValue();
  }

  get totalItems(): number {
    return this.cart.totalItems;
  }

  loadCart(): void {
    this.http.get<Cart>(this.url).pipe(
      catchError(() => of({ items: [], totalItems: 0, totalPrice: 0 }))
    ).subscribe(cart => {
      this.cartSubject.next(cart);
    });
  }

  addToCart(product: Product, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.url}/items`, {
      productId: product.id,
      quantity
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  updateQuantity(productId: number, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.url}/items/${productId}`, {
      quantity
    }).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  removeFromCart(productId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.url}/items/${productId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.url).pipe(
      tap(() => this.cartSubject.next({ items: [], totalItems: 0, totalPrice: 0 }))
    );
  }

  getItemQuantity(productId: number): number {
    const item = this.cart.items.find(i => i.productId === productId);
    return item ? item.quantity : 0;
  }

  checkout(deliveryType: 'TABLE' | 'PICKUP' = 'TABLE'): Observable<UserOrder> {
    return this.http.post<UserOrder>(`${this.url}/checkout?deliveryType=${deliveryType}`, {}).pipe(
      tap(() => this.cartSubject.next({ items: [], totalItems: 0, totalPrice: 0 }))
    );
  }
}
