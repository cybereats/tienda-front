import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComputerService } from '../../../../services/computer.service';
import { BookingService } from '../../../../services/booking.service';
import { AuthService } from '../../../../services/auth.service';
import { Computer } from '../../../../models/computer.model';

@Component({
  selector: 'app-qr-booking',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './qr-booking.html',
  styleUrl: './qr-booking.scss',
})
export class QrBooking implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private computerService = inject(ComputerService);
  private bookingService = inject(BookingService);
  readonly authService = inject(AuthService);

  pc = signal<Computer | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  loadError = signal('');
  submitError = signal('');
  successMessage = signal('');

  readonly MAX_HOURS = 8;
  readonly MIN_HOURS = 1;
  readonly PRICE_PER_HOUR = 3.5;

  hours = 1;

  get totalPrice(): number {
    return this.PRICE_PER_HOUR * this.hours;
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.loadError.set('El enlace del QR no es válido. Asegúrate de escanear el código correctamente.');
      this.isLoading.set(false);
      return;
    }

    this.computerService.findById<Computer>(slug).subscribe({
      next: (pc) => {
        this.pc.set(pc);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.loadError.set('Este ordenador no existe o ha sido eliminado del sistema.');
        } else if (err.status === 0) {
          this.loadError.set('No se pudo conectar con el servidor. Comprueba tu conexión.');
        } else {
          this.loadError.set('No pudimos cargar la información del ordenador. Inténtalo de nuevo.');
        }
        this.isLoading.set(false);
      }
    });
  }

  incrementHours(): void {
    if (this.hours < this.MAX_HOURS) {
      this.hours++;
    }
  }

  decrementHours(): void {
    if (this.hours > this.MIN_HOURS) {
      this.hours--;
    }
  }

  setHours(value: number): void {
    this.hours = Math.max(this.MIN_HOURS, Math.min(this.MAX_HOURS, value));
  }

  goToLogin(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: `/reservar/${slug}` } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToRegister(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.router.navigate(['/register'], { queryParams: { returnUrl: `/reservar/${slug}` } });
    } else {
      this.router.navigate(['/register']);
    }
  }

  pay(): void {
    const pc = this.pc();
    if (!pc || pc.status !== 'AVAILABLE') {
      return;
    }

    const state = {
      source: 'reservation',
      amount: this.totalPrice,
      data: {
        hours: this.hours,
        pcId: pc.id
      }
    };
    this.router.navigate(['/payment'], { state });
  }

  getParsedSpecs(specs: string) {
    if (!specs) return { cpu: 'N/A', gpu: 'N/A', ram: 'N/A' };
    const parts = specs.split(',').map(p => p.trim());
    return {
      cpu: parts[0] || 'N/A',
      gpu: parts[1] || 'N/A',
      ram: parts[2] || 'N/A'
    };
  }
}
