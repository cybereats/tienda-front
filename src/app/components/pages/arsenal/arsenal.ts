import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ComputerService } from '../../../../services/computer.service';
import { BookingService } from '../../../../services/booking.service';
import { AuthService } from '../../../../services/auth.service';
import { Computer, ComputerResponse, CategoryPC } from '../../../../models/computer.model';
import { Booking } from '../../../../models/booking.model';
import { forkJoin } from 'rxjs';

export interface ArsenalSection {
    category: CategoryPC;
    stations: Computer[];
}

@Component({
    selector: 'app-arsenal',
    imports: [CommonModule, RouterLink],
    templateUrl: './arsenal.html',
    styleUrl: './arsenal.scss',
})
export class Arsenal implements OnInit {
    private computerService = inject(ComputerService);
    private bookingService = inject(BookingService);
    private router = inject(Router);
    readonly authService = inject(AuthService);

    stations: Computer[] = [];
    categories: CategoryPC[] = [];
    isLoading = true;

    bottomSection?: ArsenalSection;
    arenaSections: ArsenalSection[] = [];
    vipSection?: ArsenalSection;

    myBookings = signal<Booking[]>([]);
    myPcIds = signal<Set<number>>(new Set());

    ngOnInit() {
        this.loadData();
        this.loadMyBookings();
    }

    loadMyBookings() {
        if (this.authService.isLoggedIn()) {
            this.bookingService.getMyActiveBookings().subscribe({
                next: (bookings) => {
                    this.myBookings.set(bookings);
                    const pcIds = new Set(bookings.map(b => b.pc.id));
                    this.myPcIds.set(pcIds);
                },
                error: () => { }
            });
        }
    }

    isMyPc(pc: Computer): boolean {
        return this.myPcIds().has(pc.id);
    }

    getBookingForPc(pc: Computer): Booking | undefined {
        return this.myBookings().find(b => b.pc.id === pc.id);
    }

    loadData() {
        this.isLoading = true;
        forkJoin({
            categories: this.computerService.getAllCategories(),
            stations: this.computerService.findAll<Computer[]>()
        }).subscribe({
            next: (response) => {
                this.categories = response.categories;
                this.stations = response.stations;
                this.organizeSections();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading arsenal data:', err);
                this.isLoading = false;
            }
        });
    }

    organizeSections() {
        const sortedCats = [...this.categories].sort((a, b) => a.id - b.id);

        const getStations = (cat: CategoryPC) =>
            this.stations.filter(s => s.categoryPCResponse?.id === cat.id);

        if (sortedCats.length > 0) {
            this.bottomSection = {
                category: sortedCats[0],
                stations: getStations(sortedCats[0])
            };
        }

        this.arenaSections = [];
        for (let i = 1; i < 6; i++) {
            if (i < sortedCats.length) {
                this.arenaSections.push({
                    category: sortedCats[i],
                    stations: getStations(sortedCats[i])
                });
            }
        }

        if (sortedCats.length > 6) {
            this.vipSection = {
                category: sortedCats[6],
                stations: getStations(sortedCats[6])
            };
        }
    }

    get availableCount() {
        return this.stations.filter(s => s.status === 'AVAILABLE').length;
    }

    get occupiedCount() {
        return this.stations.filter(s => s.status === 'OCCUPIED').length;
    }

    selectedStation: Computer | null = null;

    selectStation(station: Computer) {
        this.selectedStation = station;
    }

    closeDetails() {
        this.selectedStation = null;
    }

    openAdminPage(pc: Computer) {
        this.router.navigate(['/pc-admin', pc.id]);
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
