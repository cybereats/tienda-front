import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingService } from '../../../../services/booking.service';
import { AuthService } from '../../../../services/auth.service';
import { Booking, PCStats } from '../../../../models/booking.model';

@Component({
  selector: 'app-pc-admin',
  imports: [CommonModule, RouterLink],
  templateUrl: './pc-admin.html',
  styleUrl: './pc-admin.scss',
})
export class PcAdmin implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);

  booking = signal<Booking | null>(null);
  pcStats = signal<PCStats | null>(null);
  isLoading = signal(true);
  error = signal('');

  private statsInterval: any;

  ngOnInit() {
    const pcId = Number(this.route.snapshot.paramMap.get('pcId'));

    if (!pcId || !this.authService.isLoggedIn()) {
      this.router.navigate(['/computers']);
      return;
    }

    this.loadBooking(pcId);
  }

  ngOnDestroy() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }
  }

  loadBooking(pcId: number) {
    this.bookingService.getMyActiveBookings().subscribe({
      next: (bookings) => {
        const booking = bookings.find(b => b.pc.id === pcId);
        if (booking) {
          this.booking.set(booking);
          this.generateStats();
          this.statsInterval = setInterval(() => this.generateStats(), 3000);
        } else {
          this.error.set('No tienes una reserva activa para este PC.');
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la información de la reserva.');
        this.isLoading.set(false);
      }
    });
  }

  generateStats() {
    this.pcStats.set({
      cpuUsage: Math.floor(Math.random() * 60) + 20,
      ramUsage: Math.floor(Math.random() * 10) + 6,
      ramTotal: 16,
      gpuUsage: Math.floor(Math.random() * 70) + 15,
      gpuTemp: Math.floor(Math.random() * 25) + 50,
      diskUsage: Math.floor(Math.random() * 40) + 30,
      networkUp: Math.floor(Math.random() * 50) + 5,
      networkDown: Math.floor(Math.random() * 200) + 50,
      uptime: this.calculateUptime(),
      activeProcesses: Math.floor(Math.random() * 80) + 40
    });
  }

  calculateUptime(): string {
    const booking = this.booking();
    if (!booking?.createdAt) return '0h 0m';

    const start = new Date(booking.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getRemainingTime(): string {
    const booking = this.booking();
    if (!booking?.createdAt) return '0h 0m';

    const start = new Date(booking.createdAt);
    const end = new Date(start.getTime() + booking.hours * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) return 'Expirado';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  getRemainingPercentage(): number {
    const booking = this.booking();
    if (!booking?.createdAt) return 0;

    const start = new Date(booking.createdAt);
    const end = new Date(start.getTime() + booking.hours * 60 * 60 * 1000);
    const now = new Date();

    const total = end.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();

    return Math.max(0, Math.min(100, (remaining / total) * 100));
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

  goBack() {
    this.router.navigate(['/computers']);
  }
}
