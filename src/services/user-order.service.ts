import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';

export interface OrderItemProduct {
  id: number;
  label: string;
  image: string;
  price: number;
}

export interface OrderItem {
  id: number;
  product: OrderItemProduct;
  quantity: number;
  price: number;
}

export interface UserOrder {
  id: number;
  user: any;
  status: string;
  deliveryType: 'TABLE' | 'PICKUP';
  createdAt: string;
  orderItems: OrderItem[];
}

export interface UserOrdersResponse {
  data: UserOrder[];
  page: number;
  size: number;
  totalElements: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserOrderService {
  private http = inject(HttpClient);
  private url = '/api/cart/my-orders';

  private ordersSubject = new BehaviorSubject<UserOrder[]>([]);
  orders$ = this.ordersSubject.asObservable();

  private pendingCountSubject = new BehaviorSubject<number>(0);
  pendingCount$ = this.pendingCountSubject.asObservable();

  get orders(): UserOrder[] {
    return this.ordersSubject.getValue();
  }

  get pendingCount(): number {
    return this.pendingCountSubject.getValue();
  }

  loadOrders(): void {
    this.http.get<UserOrdersResponse>(this.url).pipe(
      catchError(() => of({ data: [], page: 1, size: 20, totalElements: 0 }))
    ).subscribe(response => {
      this.ordersSubject.next(response.data);
      const pending = response.data.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;
      this.pendingCountSubject.next(pending);
    });
  }

  addOrder(order: UserOrder): void {
    const current = this.ordersSubject.getValue();
    this.ordersSubject.next([order, ...current]);
    if (order.status === 'PENDING' || order.status === 'PROCESSING') {
      this.pendingCountSubject.next(this.pendingCount + 1);
    }
  }

  getTotalPrice(order: UserOrder): number {
    return order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': '⏳ Pendiente',
      'PROCESSING': '👨‍🍳 Preparando',
      'READY': '✅ Listo',
      'DELIVERED': '🚀 Entregado',
      'CANCELLED': '❌ Cancelado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'PENDING': 'status--pending',
      'PROCESSING': 'status--processing',
      'READY': 'status--ready',
      'DELIVERED': 'status--delivered',
      'CANCELLED': 'status--cancelled'
    };
    return classes[status] || '';
  }
}
