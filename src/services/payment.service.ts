import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = '/api/payments';

  payWithCard(cardData: any, amount: number, id: string, source: 'cart' | 'reservation' = 'cart'): Observable<void> {
    const concepto = source === 'reservation' ? `RESERVA #${id}` : `PEDIDO #${id}`;
    // Convert MM/YY to YYYY-MM-DD (last day of month or just first day, usually API expects LocalDate)
    // Assuming 01 for day
    const [month, year] = cardData.expiryDate.split('/');
    const fullYear = `20${year}`;
    const formattedDate = `${fullYear}-${month}-01`;

    const request = {
      autorizacion: {
        login: "usuario1", // Mocked
        api_token: "token_demo_123" // Mocked
      },
      origen: {
        id: null,
        numeroTarjeta: cardData.cardNumber.replace(/\s/g, ''),
        fechaCaducidad: formattedDate,
        cvc: parseInt(cardData.cvv, 10),
        nombreCompleto: cardData.cardHolder
      },
      destino: {
        iban: "ES1234567890123456789012" // Mocked Store IBAN
      },
      pago: {
        importe: amount,
        concepto: concepto
      }
    };

    return this.http.post<void>(`${this.apiUrl}/card`, request);
  }

  getNextOrderId(): Observable<number> {
    return this.http.get<number>('/api/orders/next-id');
  }

  getNextBookingId(): Observable<number> {
    return this.http.get<number>('/api/bookings/next-id');
  }
}
