import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CPopup } from '../../ui/c-popup/c-popup';
import { CartService } from '../../../../services/cart.service';
import { BookingService } from '../../../../services/booking.service';
import { PaymentService } from '../../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-payment',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './payment.html',
    styleUrl: './payment.scss'
})
export class Payment {
    paymentForm: FormGroup;
    transferForm: FormGroup;
    selectedMethod: 'card' | 'paypal' | 'apple' | 'transfer' = 'card';
    cardType: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown' = 'unknown';
    orderId: string = 'Cargando...';
    totalPrice: number = 0;
    cartSubscription: any;

    private cartService = inject(CartService);
    private bookingService = inject(BookingService);
    private paymentService = inject(PaymentService);
    private router = inject(Router);
    private dialog = inject(MatDialog);

    paymentSource: 'cart' | 'reservation' = 'cart';
    reservationData: any = null;

    constructor(private fb: FormBuilder) {
        const state = history.state;
        if (state && state.source === 'reservation') {
            this.paymentSource = 'reservation';
            this.totalPrice = state.amount || 0;
            this.reservationData = state.data;
        } else {
            this.cartSubscription = this.cartService.cart$.subscribe(cart => {
                this.totalPrice = cart.totalPrice;
            });
        }

        if (this.paymentSource === 'cart') {
            this.paymentService.getNextOrderId().subscribe(id => this.orderId = id.toString());
        } else {
            this.paymentService.getNextBookingId().subscribe(id => this.orderId = id.toString());
        }

        this.paymentForm = this.fb.group({
            cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{13,19}$/)]],
            expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)]],
            cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
            cardHolder: ['', [Validators.required]]
        });

        this.paymentForm.get('cardNumber')?.valueChanges.subscribe(value => {
            this.detectCardType(value);
        });

        this.transferForm = this.fb.group({
            senderName: ['', Validators.required],
            senderIban: ['', [Validators.required, Validators.pattern(/^ES[0-9]{22}$/)]]
        });
    }

    ngOnDestroy() {
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }
    }

    selectMethod(method: 'card' | 'paypal' | 'apple' | 'transfer') {
        this.selectedMethod = method;
    }

    detectCardType(number: string) {
        const cleanNumber = number.replace(/\s+/g, '');

        if (cleanNumber.startsWith('4')) {
            this.cardType = 'visa';
        } else if (/^5[1-5]/.test(cleanNumber) || /^222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[0-1][0-9]|2720/.test(cleanNumber)) {
            this.cardType = 'mastercard';
        } else if (/^3[47]/.test(cleanNumber)) {
            this.cardType = 'amex';
        } else if (/^6(?:011|5)/.test(cleanNumber)) {
            this.cardType = 'discover';
        } else {
            this.cardType = 'unknown';
        }
    }

    onSubmit() {
        if (this.selectedMethod === 'card' && this.paymentForm.valid) {
            console.log('Payment submitted (Card)', this.paymentForm.value);

            this.paymentService.payWithCard(this.paymentForm.value, this.totalPrice, this.orderId, this.paymentSource)
                .subscribe({
                    next: () => {
                        this.processPayment();
                    },
                    error: (err: any) => {
                        console.error('Card payment failed', err);
                        const errorMessage = this.mapPaymentError(err);
                        this.showPopup('Error en el Pago', errorMessage, 'error');
                    }
                });

        } else if (this.selectedMethod === 'transfer' && this.transferForm.valid) {
            console.log('Payment submitted (Transfer)', this.transferForm.value);
            this.processPayment();
        } else {
            if (this.selectedMethod === 'card') this.paymentForm.markAllAsTouched();
            if (this.selectedMethod === 'transfer') this.transferForm.markAllAsTouched();
        }
    }

    private mapPaymentError(err: any): string {
        if (err.status === 0 || err.status >= 500) {
            return 'Error al procesar el pago';
        }

        const message = err.error?.message || (typeof err.error === 'string' ? err.error : '');

        const formatErrors = ["Errores de validación", "numeroTarjeta", "fechaCaducidad", "Invalid card number"];
        const invalidDataErrors = [
            "Tarjeta no encontrada",
            "CVC incorrecto",
            "La fecha de caducidad no coincide",
            "Nombre del titular incorrecto",
            "Fecha de caducidad incorrecta"
        ];

        if (formatErrors.some(msg => message.includes(msg))) {
            return 'Formato de la tarjeta Invalido';
        }

        if (invalidDataErrors.some(msg => message.includes(msg))) {
            return 'Tarjeta invalida';
        }

        return message || 'Error al procesar el pago';
    }

    processPayment() {
        if (this.paymentSource === 'cart') {
            this.cartService.checkout().subscribe({
                next: (order) => {
                    console.log('Order created', order);
                    const dialogRef = this.showPopup('Pedido Realizado', '¡Pedido realizado con éxito!', 'success');
                    dialogRef.afterClosed().subscribe(() => {
                        this.router.navigate(['/food']);
                    });
                },
                error: (err) => {
                    console.error('Error checkout', err);
                    const errorMessage = err.error?.message || (typeof err.error === 'string' ? err.error : 'Error al procesar el pedido');
                    this.showPopup('Error en el Pedido', errorMessage, 'error');
                }
            });
        } else if (this.paymentSource === 'reservation' && this.reservationData) {
            this.bookingService.post(this.reservationData).subscribe({
                next: () => {
                    const dialogRef = this.showPopup('Pago Confirmado', '¡Reserva pagada y confirmada con éxito!', 'success');
                    dialogRef.afterClosed().subscribe(() => {
                        this.router.navigate(['/computers']);
                    });
                },
                error: (err) => {
                    console.error('Error reservation full:', err);
                    const errorMessage = err.error?.message || (typeof err.error === 'string' ? err.error : err.statusText) || 'Error desconocido';
                    this.showPopup('Error en la Reserva', errorMessage, 'error');
                }
            });
        }
    }

    // Helper for card number formatting
    formatCardNumber(event: any) {
        let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += ' ';
            }
            formattedValue += value[i];
        }
        event.target.value = formattedValue;
        this.paymentForm.get('cardNumber')?.setValue(formattedValue, { emitEvent: false });
        this.detectCardType(formattedValue);
    }

    formatExpiry(event: any) {
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        event.target.value = value;
        this.paymentForm.get('expiryDate')?.setValue(value, { emitEvent: false });
    }

    showPopup(title: string, message: string, type: 'success' | 'error' | 'info') {
        return this.dialog.open(CPopup, {
            data: { title, message, type },
            width: 'auto',
            minWidth: '350px'
        });
    }
}
