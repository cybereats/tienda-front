import { Component, inject, OnInit, OnDestroy, signal, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ComputerService } from '../../../../services/computer.service';
import { BookingService } from '../../../../services/booking.service';
import { AuthService } from '../../../../services/auth.service';
import { Computer, CategoryPC } from '../../../../models/computer.model';
import { Booking } from '../../../../models/booking.model';
import { forkJoin, interval, Subscription } from 'rxjs';
import Konva from 'konva';

export interface ArsenalSection {
    category: CategoryPC;
    stations: Computer[];
}

interface SeatConfig {
    pc: Computer;
    x: number;
    y: number;
    group?: Konva.Group;
}

@Component({
    selector: 'app-arsenal',
    imports: [CommonModule, RouterLink],
    templateUrl: './arsenal.html',
    styleUrl: './arsenal.scss',
})
export class Arsenal implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('konvaContainer', { static: true }) konvaContainer!: ElementRef<HTMLDivElement>;

    private computerService = inject(ComputerService);
    private bookingService = inject(BookingService);
    private router = inject(Router);
    readonly authService = inject(AuthService);

    private refreshSubscription?: Subscription;
    private stage!: Konva.Stage;
    private layer!: Konva.Layer;
    private mainGroup!: Konva.Group;
    private seats: SeatConfig[] = [];

    stations: Computer[] = [];
    categories: CategoryPC[] = [];
    isLoading = true;

    private readonly MAP_WIDTH = 1100;
    private readonly MAP_HEIGHT = 1020;
    private readonly SEAT_SIZE = 34;

    private currentScale = 1;
    private readonly MIN_SCALE = 0.35;
    private readonly MAX_SCALE = 2.5;

    myBookings = signal<Booking[]>([]);
    myPcIds = signal<Set<number>>(new Set());
    selectedStation = signal<Computer | null>(null);

    private readonly COLORS = {
        available: '#00ff9f',
        occupied: '#ff3366',
        maintenance: '#4a5568',
        mine: '#00d4ff',
        selected: '#ffdd00',
        floor: '#0d0d12',
        floorGradient: '#12121a',
        wall: '#1a1a2e',
        wallStroke: '#00e5ff',
        accent: '#00e5ff',
        accentAlt: '#7c3aed',
        danger: '#ff006e',
        text: '#ffffff',
        textMuted: '#6b7280',
        neonPink: '#ff00ff',
        neonGreen: '#39ff14',
        neonBlue: '#00f5ff'
    };

    private readonly CATEGORY_CONFIG: { [key: string]: { color: string; icon: string; glow: string } } = {
        'gama-baja': { color: '#22d3ee', icon: 'B', glow: 'rgba(34, 211, 238, 0.4)' },
        'gama-media': { color: '#10b981', icon: 'G', glow: 'rgba(16, 185, 129, 0.4)' },
        'gama-alta': { color: '#f43f5e', icon: 'E', glow: 'rgba(244, 63, 94, 0.4)' },
        'streaming': { color: '#a855f7', icon: 'S', glow: 'rgba(168, 85, 247, 0.4)' },
        'esports': { color: '#ef4444', icon: 'X', glow: 'rgba(239, 68, 68, 0.5)' }
    };

    getCategoryPrice(slug: string): number {
        const category = this.categories.find(c => c.slug === slug);
        return category?.price ?? 0;
    }

    readonly CATEGORY_DISPLAY_NAMES: { [slug: string]: string } = {
        'gama-baja': 'GAMA BAJA',
        'gama-media': 'GAMA MEDIA',
        'gama-alta': 'GAMA ALTA',
        'streaming': 'STREAMING',
        'esports': 'ESPORTS',
    };

    getCategoryDisplayName(slug: string): string {
        return this.CATEGORY_DISPLAY_NAMES[slug] ?? slug.toUpperCase();
    }

    private resizeObserver: ResizeObserver | null = null;

    ngOnInit() {
        this.loadData();
        this.loadMyBookings();
    }

    ngAfterViewInit() {
        this.initKonva();
        this.initResizeObserver();
    }

    ngOnDestroy() {
        this.stopAutoRefresh();
        if (this.stage) {
            this.stage.destroy();
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    private initResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.resizeStage();
        });
        if (this.konvaContainer) {
            this.resizeObserver.observe(this.konvaContainer.nativeElement);
        }
    }

    private initKonva() {
        const container = this.konvaContainer.nativeElement;
        // Start with a default size, but it will be updated by ResizeObserver immediately
        const width = container.offsetWidth || 800;
        const height = container.offsetHeight || 600;

        this.stage = new Konva.Stage({
            container: container,
            width: width,
            height: height,
            draggable: true,
        });

        this.layer = new Konva.Layer();
        this.mainGroup = new Konva.Group();
        this.layer.add(this.mainGroup);
        this.stage.add(this.layer);

        this.stage.on('wheel', (e: any) => {
            e.evt.preventDefault();
            const oldScale = this.stage.scaleX();
            const pointer = this.stage.getPointerPosition()!;

            const mousePointTo = {
                x: (pointer.x - this.stage.x()) / oldScale,
                y: (pointer.y - this.stage.y()) / oldScale,
            };

            const direction = e.evt.deltaY > 0 ? -1 : 1;
            const newScale = direction > 0 ? oldScale * 1.1 : oldScale / 1.1;

            this.currentScale = Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, newScale));

            this.stage.scale({ x: this.currentScale, y: this.currentScale });

            const newPos = {
                x: pointer.x - mousePointTo.x * this.currentScale,
                y: pointer.y - mousePointTo.y * this.currentScale,
            };
            this.stage.position(newPos);
        });
    }

    private centerMap() {
        if (!this.stage) return;
        const containerW = this.stage.width();
        const containerH = this.stage.height();

        // Calculate scale to fit the map with some padding
        const padding = 60;
        const scaleX = containerW / (this.MAP_WIDTH + padding);
        const scaleY = containerH / (this.MAP_HEIGHT + padding);

        // Use the smaller scale to ensure fit, with a reasonable max limit
        const scale = Math.min(scaleX, scaleY, 1.0);
        this.currentScale = scale;

        this.stage.scale({ x: scale, y: scale });

        // Center the map group within the stage
        this.stage.position({
            x: (containerW - this.MAP_WIDTH * scale) / 2,
            y: (containerH - this.MAP_HEIGHT * scale) / 2
        });

        this.stage.batchDraw();
    }

    private resizeStage() {
        if (!this.stage || !this.konvaContainer) return;

        const container = this.konvaContainer.nativeElement;
        // Use getBoundingClientRect for more accurate measurements
        const rect = container.getBoundingClientRect();

        const width = rect.width || container.offsetWidth;
        const height = rect.height || container.offsetHeight || (window.innerHeight - 100);

        this.stage.width(width);
        this.stage.height(height);

        // Re-center after resizing
        this.centerMap();
    }

    private startAutoRefresh() {
        this.refreshSubscription = interval(3000).subscribe(() => {
            this.refreshStations();
        });
    }

    private stopAutoRefresh() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    private refreshStations() {
        this.computerService.findAll<Computer[]>().subscribe({
            next: (stations) => {
                const hasChanges = this.detectChanges(stations);
                if (hasChanges) {
                    this.stations = stations;
                    this.updateSeatColors();
                    const selected = this.selectedStation();
                    if (selected) {
                        const updated = stations.find(s => s.id === selected.id);
                        if (updated) {
                            this.selectedStation.set(updated);
                        }
                    }
                }
            }
        });
    }

    private detectChanges(newStations: Computer[]): boolean {
        if (this.stations.length !== newStations.length) return true;

        for (const newPc of newStations) {
            const oldPc = this.stations.find(s => s.id === newPc.id);
            if (!oldPc || oldPc.status !== newPc.status) {
                return true;
            }
        }
        return false;
    }

    loadMyBookings() {
        if (this.authService.isLoggedIn()) {
            this.bookingService.getMyActiveBookings().subscribe({
                next: (bookings) => {
                    this.myBookings.set(bookings);
                    const pcIds = new Set(bookings.map(b => b.pc.id));
                    this.myPcIds.set(pcIds);
                    this.updateSeatColors();
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

    private readonly VALID_SLUGS = new Set(['gama-baja', 'gama-media', 'gama-alta', 'streaming', 'esports']);

    loadData() {
        this.isLoading = true;
        forkJoin({
            categories: this.computerService.getAllCategories(),
            stations: this.computerService.findAll<Computer[]>()
        }).subscribe({
            next: (response) => {
                this.categories = response.categories.filter(c => this.VALID_SLUGS.has(c.slug));
                this.stations = response.stations.filter(s => this.VALID_SLUGS.has(s.categoryPCResponse?.slug));
                this.isLoading = false;
                setTimeout(() => {
                    this.drawMap();
                    this.centerMap();
                    this.startAutoRefresh();
                }, 100);
            },
            error: (err) => {
                console.error('Error loading arsenal data:', err);
                this.isLoading = false;
            }
        });
    }

    zoomIn() {
        this.currentScale = Math.min(this.MAX_SCALE, this.currentScale * 1.2);
        this.stage.scale({ x: this.currentScale, y: this.currentScale });
        this.layer.batchDraw();
    }

    zoomOut() {
        this.currentScale = Math.max(this.MIN_SCALE, this.currentScale / 1.2);
        this.stage.scale({ x: this.currentScale, y: this.currentScale });
        this.layer.batchDraw();
    }

    resetZoom() {
        this.centerMap();
        this.layer.batchDraw();
    }

    private drawMap() {
        if (!this.layer || !this.stage) return;

        this.mainGroup.destroyChildren();
        this.layer.destroyChildren();
        this.mainGroup = new Konva.Group();
        this.layer.add(this.mainGroup);
        this.seats = [];

        this.drawFloorPlan();

        this.drawPCSections();

        this.layer.batchDraw();
    }

    private drawFloorPlan() {
        const floor = new Konva.Rect({
            x: 0,
            y: 0,
            width: this.MAP_WIDTH,
            height: this.MAP_HEIGHT,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: this.MAP_WIDTH, y: this.MAP_HEIGHT },
            fillLinearGradientColorStops: [0, '#0a0a0f', 0.5, '#0d1117', 1, '#0a0a0f'],
            stroke: this.COLORS.wallStroke,
            strokeWidth: 4,
            cornerRadius: 15,
        });
        this.mainGroup.add(floor);

        this.mainGroup.add(new Konva.Rect({
            x: 8,
            y: 8,
            width: this.MAP_WIDTH - 16,
            height: this.MAP_HEIGHT - 16,
            stroke: 'rgba(0, 229, 255, 0.15)',
            strokeWidth: 1,
            cornerRadius: 12,
        }));

        for (let i = 0; i < this.MAP_WIDTH; i += 60) {
            const opacity = i % 120 === 0 ? 0.08 : 0.03;
            this.mainGroup.add(new Konva.Line({
                points: [i, 0, i, this.MAP_HEIGHT],
                stroke: `rgba(0, 229, 255, ${opacity})`,
                strokeWidth: 1,
            }));
        }
        for (let i = 0; i < this.MAP_HEIGHT; i += 60) {
            const opacity = i % 120 === 0 ? 0.08 : 0.03;
            this.mainGroup.add(new Konva.Line({
                points: [0, i, this.MAP_WIDTH, i],
                stroke: `rgba(0, 229, 255, ${opacity})`,
                strokeWidth: 1,
            }));
        }

        const corners = [[30, 30], [this.MAP_WIDTH - 30, 30], [30, this.MAP_HEIGHT - 30], [this.MAP_WIDTH - 30, this.MAP_HEIGHT - 30]];
        corners.forEach(([cx, cy]) => {
            this.mainGroup.add(new Konva.Circle({ x: cx, y: cy, radius: 8, stroke: this.COLORS.accent, strokeWidth: 2, fill: 'transparent' }));
            this.mainGroup.add(new Konva.Circle({ x: cx, y: cy, radius: 3, fill: this.COLORS.accent }));
        });

        const titleY = 15;
        const titleW = 600;
        const titleCenterX = this.MAP_WIDTH / 2;
        this.mainGroup.add(new Konva.Line({
            points: [titleCenterX - 360, titleY + 12, titleCenterX - titleW / 2 - 10, titleY + 12],
            stroke: this.COLORS.accent,
            strokeWidth: 2,
        }));
        this.mainGroup.add(new Konva.Line({
            points: [titleCenterX + titleW / 2 + 10, titleY + 12, titleCenterX + 360, titleY + 12],
            stroke: this.COLORS.accent,
            strokeWidth: 2,
        }));
        this.mainGroup.add(new Konva.Text({
            x: titleCenterX - titleW / 2,
            y: titleY,
            text: 'CYBERZONE GAMING CENTER',
            fontSize: 20,
            fontStyle: 'bold',
            fontFamily: 'Arial Black, sans-serif',
            fill: this.COLORS.accent,
            align: 'center',
            width: titleW,
        }));

        this.drawZoneLabels();

        const serviceY = this.MAP_HEIGHT - 90;

        this.drawPremiumRoom(50, serviceY, 130, 70, '▶', 'ENTRADA', this.COLORS.neonGreen, 'entrada');

        this.drawPremiumRoom(200, serviceY, 130, 70, '', 'RECEPCIÓN', '#fbbf24', 'recepcion');

        this.drawPremiumRoom(350, serviceY, 130, 70, '', 'CAFETERÍA', '#fb923c', 'cafeteria');

        this.drawPremiumRoom(500, serviceY, 130, 70, '', 'SERVICIOS', '#60a5fa', 'banos');

        this.drawPremiumRoom(650, serviceY, 130, 70, '', 'SERVIDORES', this.COLORS.danger, 'servers', true);

        this.drawEmergencyExit(this.MAP_WIDTH - 80, serviceY, 50, 65);

        this.mainGroup.add(new Konva.Rect({
            x: 40,
            y: serviceY - 12,
            width: this.MAP_WIDTH - 80,
            height: 6,
            fill: 'rgba(0, 229, 255, 0.02)',
            stroke: 'rgba(0, 229, 255, 0.08)',
            strokeWidth: 1,
            dash: [10, 5],
        }));
    }

    private drawZoneLabels() {
        this.drawZoneBanner(25, 52, 940, 'ZONA GAMING', '#22d3ee', '▸');

        this.drawZoneBanner(25, 395, 310, 'ZONA STREAMING', '#a855f7', '▸');

        this.drawEsportsZone(390, 395, 610, 300);
    }

    private drawZoneBanner(x: number, y: number, width: number, label: string, color: string, icon: string) {
        const banner = new Konva.Group({ x, y });

        banner.add(new Konva.Rect({
            x: -10,
            y: -8,
            width: width + 20,
            height: 28,
            fill: `${color}08`,
            stroke: `${color}30`,
            strokeWidth: 1,
            cornerRadius: 6,
        }));

        banner.add(new Konva.Text({
            x: 0,
            y: 0,
            text: `${icon} ${label}`,
            fontSize: 14,
            fontStyle: 'bold',
            fill: color,
            letterSpacing: 2,
        }));

        this.mainGroup.add(banner);
    }

    private drawEsportsZone(x: number, y: number, width: number, height: number) {
        const zone = new Konva.Group({ x, y });
        const color = '#ef4444';

        zone.add(new Konva.Rect({
            x: -15,
            y: -15,
            width: width + 30,
            height: height + 30,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: width, y: height },
            fillLinearGradientColorStops: [0, 'rgba(239, 68, 68, 0.05)', 0.5, 'rgba(239, 68, 68, 0.02)', 1, 'rgba(239, 68, 68, 0.05)'],
            stroke: color,
            strokeWidth: 3,
            cornerRadius: 20,
        }));

        zone.add(new Konva.Rect({
            x: -8,
            y: -8,
            width: width + 16,
            height: height + 16,
            stroke: `${color}30`,
            strokeWidth: 1,
            cornerRadius: 16,
        }));

        zone.add(new Konva.Text({
            x: 0,
            y: -5,
            width,
            text: 'ARENA ESPORTS - COMPETICIÓN',
            fontSize: 16,
            fontStyle: 'bold',
            fill: color,
            align: 'center',
        }));

        this.mainGroup.add(zone);
    }

    private drawPremiumRoom(x: number, y: number, width: number, height: number, icon: string, label: string, color: string, type: string, isRestricted = false) {
        const room = new Konva.Group({ x, y });

        room.add(new Konva.Rect({
            width,
            height,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: width, y: height },
            fillLinearGradientColorStops: [0, `${color}08`, 1, `${color}15`],
            stroke: color,
            strokeWidth: isRestricted ? 2 : 3,
            cornerRadius: 12,
            dash: isRestricted ? [10, 5] : undefined,
        }));

        const hasIcon = icon.trim().length > 0;
        const labelSize = 12;

        if (isRestricted) {
            const subSize = 8;
            const gap = 5;
            const totalH = labelSize + gap + subSize;
            const startY = (height - totalH) / 2;

            room.add(new Konva.Text({
                x: 0, y: startY, width,
                text: label, fontSize: labelSize, fontStyle: 'bold',
                fill: color, align: 'center',
            }));
            room.add(new Konva.Text({
                x: 0, y: startY + labelSize + gap, width,
                text: 'SOLO STAFF', fontSize: subSize,
                fill: this.COLORS.danger, align: 'center',
            }));
        } else if (hasIcon) {
            const iconSize = 20;
            const gap = 4;
            const totalH = iconSize + gap + labelSize;
            const startY = (height - totalH) / 2;

            room.add(new Konva.Text({
                x: 0, y: startY, width,
                text: icon, fontSize: iconSize, align: 'center',
            }));
            room.add(new Konva.Text({
                x: 0, y: startY + iconSize + gap, width,
                text: label, fontSize: labelSize, fontStyle: 'bold',
                fill: color, align: 'center',
            }));
        } else {
            room.add(new Konva.Text({
                x: 0,
                y: (height - labelSize) / 2,
                width,
                text: label, fontSize: labelSize, fontStyle: 'bold',
                fill: color, align: 'center',
            }));
        }

        if (type === 'entrada') {
            room.add(new Konva.Arrow({
                points: [width / 2, height + 25, width / 2, height - 5],
                pointerLength: 12,
                pointerWidth: 12,
                fill: color,
                stroke: color,
                strokeWidth: 3,
            }));
            room.add(new Konva.Text({
                x: 0,
                y: height + 30,
                width,
                text: '↑ ACCESO',
                fontSize: 10,
                fill: color,
                align: 'center',
            }));
        }

        this.mainGroup.add(room);
    }

    private drawEmergencyExit(x: number, y: number, width: number, height: number) {
        const exit = new Konva.Group({ x, y });

        exit.add(new Konva.Rect({
            width,
            height,
            fill: 'rgba(255, 0, 50, 0.1)',
            stroke: '#ff0040',
            strokeWidth: 2,
            cornerRadius: 6,
            dash: [6, 3],
        }));

        const line1Size = 9;
        const line2Size = 7;
        const gap = 4;
        const totalH = line1Size + gap + line2Size;
        const startY = (height - totalH) / 2;

        exit.add(new Konva.Text({
            x: 0,
            y: startY,
            width,
            text: 'SALIDA',
            fontSize: line1Size,
            fontStyle: 'bold',
            fill: '#ff4466',
            align: 'center',
        }));

        exit.add(new Konva.Text({
            x: 0,
            y: startY + line1Size + gap,
            width,
            text: 'EMERGENCIA',
            fontSize: line2Size,
            fill: '#ff6688',
            align: 'center',
        }));

        this.mainGroup.add(exit);
    }

    private drawPCSections() {
        const sortedCats = [...this.categories].sort((a, b) => a.id - b.id);

        const layouts: { [key: string]: { x: number; y: number; cols: number; zone: string } } = {
            'gama-baja': { x: 50, y: 90, cols: 5, zone: 'gaming' },
            'gama-media': { x: 355, y: 90, cols: 5, zone: 'gaming' },
            'gama-alta': { x: 660, y: 90, cols: 5, zone: 'gaming' },

            'streaming': { x: 50, y: 435, cols: 5, zone: 'streaming' },

            'esports': { x: 420, y: 435, cols: 10, zone: 'esports' },
        };

        sortedCats.forEach((category) => {
            const layout = layouts[category.slug];
            if (!layout) return;

            const pcs = this.stations.filter(s => s.categoryPCResponse?.id === category.id);
            if (pcs.length === 0) return;

            const config = this.CATEGORY_CONFIG[category.slug] || { color: this.COLORS.accent, icon: '•', glow: 'rgba(0, 229, 255, 0.3)' };
            const isSpecial = layout.zone === 'esports';

            this.drawPremiumSection(layout.x, layout.y, category, pcs, config, layout.cols, isSpecial, layout.zone);
        });
    }

    private drawPremiumSection(x: number, y: number, category: CategoryPC, pcs: Computer[], config: { color: string; icon: string; glow: string }, cols: number, isSpecial: boolean, zone: string = '') {
        const section = new Konva.Group({ x, y });
        const color = config.color;

        const seatSpacing = this.SEAT_SIZE + 16;
        const rows = Math.ceil(pcs.length / cols);
        const width = cols * seatSpacing + 50;
        const height = rows * seatSpacing + 90;

        section.add(new Konva.Rect({
            x: -20,
            y: -15,
            width,
            height,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: width, y: height },
            fillLinearGradientColorStops: isSpecial
                ? [0, `${color}18`, 0.5, `${color}08`, 1, `${color}18`]
                : [0, `${color}10`, 1, `${color}05`],
            stroke: color,
            strokeWidth: isSpecial ? 3 : 2,
            cornerRadius: 16,
        }));

        section.add(new Konva.Rect({
            x: -15,
            y: -10,
            width: width - 10,
            height: height - 10,
            stroke: `${color}25`,
            strokeWidth: 1,
            cornerRadius: 14,
        }));

        section.add(new Konva.Line({
            points: [-10, 2, width - 40, 2],
            stroke: color,
            strokeWidth: isSpecial ? 4 : 3,
        }));

        section.add(new Konva.Text({
            x: 5,
            y: 8,
            text: config.icon,
            fontSize: 18,
        }));

        section.add(new Konva.Text({
            x: 28,
            y: 10,
            text: this.CATEGORY_DISPLAY_NAMES[category.slug] || category.label.toUpperCase(),
            fontSize: 13,
            fontStyle: 'bold',
            fontFamily: 'Arial Black, sans-serif',
            fill: color,
        }));

        const row2Y = 30;

        const price = category.price ?? 0;
        section.add(new Konva.Rect({
            x: 5,
            y: row2Y,
            width: 60,
            height: 20,
            fill: 'rgba(251, 191, 36, 0.12)',
            cornerRadius: 10,
            stroke: '#fbbf24',
            strokeWidth: 1,
        }));
        section.add(new Konva.Text({
            x: 5,
            y: row2Y + 4,
            width: 60,
            text: `${price.toFixed(2)}€/h`,
            fontSize: 10,
            fontStyle: 'bold',
            fill: '#fbbf24',
            align: 'center',
        }));

        const available = pcs.filter(p => p.status === 'AVAILABLE').length;
        const countBgColor = available > 0 ? 'rgba(0, 255, 159, 0.15)' : 'rgba(255, 51, 102, 0.15)';
        const countTextColor = available > 0 ? this.COLORS.available : this.COLORS.occupied;

        section.add(new Konva.Rect({
            x: 72,
            y: row2Y,
            width: 60,
            height: 20,
            fill: countBgColor,
            cornerRadius: 10,
            stroke: countTextColor,
            strokeWidth: 1,
        }));
        section.add(new Konva.Text({
            x: 72,
            y: row2Y + 4,
            width: 60,
            text: `${available}/${pcs.length}`,
            fontSize: 10,
            fontStyle: 'bold',
            fill: countTextColor,
            align: 'center',
        }));

        pcs.forEach((pc, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const seatX = col * seatSpacing + this.SEAT_SIZE / 2 + 15;
            const seatY = row * seatSpacing + this.SEAT_SIZE / 2 + 65;

            const seatGroup = this.createPremiumSeat(pc, seatX, seatY, config.color);
            section.add(seatGroup);

            this.seats.push({
                pc,
                x: x + seatX,
                y: y + seatY,
                group: seatGroup
            });
        });

        if (isSpecial) {
            section.add(new Konva.Text({
                x: width - 50,
                y: height - 30,
                text: '★',
                fontSize: 18,
            }));
        }

        this.mainGroup.add(section);
    }

    private createPremiumSeat(pc: Computer, x: number, y: number, categoryColor: string): Konva.Group {
        const group = new Konva.Group({ x, y });
        const size = this.SEAT_SIZE;
        const half = size / 2;
        const isSelected = this.selectedStation()?.id === pc.id;
        const isMine = this.isMyPc(pc);

        const fillColor = pc.status === 'MAINTENANCE' ? this.COLORS.maintenance
            : isMine ? this.COLORS.mine
                : pc.status === 'AVAILABLE' ? this.COLORS.available
                    : this.COLORS.occupied;

        const dimColor = pc.status === 'MAINTENANCE' ? 'rgba(74, 85, 104, 0.15)'
            : isMine ? 'rgba(0, 212, 255, 0.2)'
                : pc.status === 'AVAILABLE' ? 'rgba(0, 255, 159, 0.15)'
                    : 'rgba(255, 51, 102, 0.15)';

        const stroke = isSelected ? this.COLORS.selected
            : isMine ? this.COLORS.mine
                : 'transparent';

        // --- Monitor shape ---
        const monW = size * 0.72;
        const monH = size * 0.48;
        const monX = -monW / 2;
        const monY = -half + 2;

        // Glow behind the monitor
        group.add(new Konva.Rect({
            x: monX - 2,
            y: monY - 2,
            width: monW + 4,
            height: monH + 4,
            fill: dimColor,
            cornerRadius: 5,
        }));

        // Monitor bezel (dark frame)
        group.add(new Konva.Rect({
            x: monX,
            y: monY,
            width: monW,
            height: monH,
            fill: '#111118',
            stroke: fillColor,
            strokeWidth: 1.5,
            cornerRadius: [4, 4, 2, 2],
        }));

        // Inner screen (lighter)
        const padding = 2.5;
        group.add(new Konva.Rect({
            x: monX + padding,
            y: monY + padding,
            width: monW - padding * 2,
            height: monH - padding * 2 - 1,
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: 0, y: monH - padding * 2 },
            fillLinearGradientColorStops: [0, fillColor, 1, this.darkenColor(fillColor, 30)],
            cornerRadius: 2,
            opacity: 0.6,
        }));

        // Stand neck
        const neckW = 3;
        const neckH = 4;
        group.add(new Konva.Rect({
            x: -neckW / 2,
            y: monY + monH,
            width: neckW,
            height: neckH,
            fill: '#222230',
        }));

        // Stand base
        const baseW = monW * 0.5;
        const baseH = 2.5;
        group.add(new Konva.Rect({
            x: -baseW / 2,
            y: monY + monH + neckH,
            width: baseW,
            height: baseH,
            fill: '#222230',
            cornerRadius: [0, 0, 2, 2],
        }));

        // Selection / ownership ring
        if (isSelected || isMine) {
            group.add(new Konva.Rect({
                x: -half - 1,
                y: -half,
                width: size + 2,
                height: size + 2,
                fill: 'transparent',
                stroke: stroke,
                strokeWidth: 2,
                cornerRadius: 6,
                dash: isMine && !isSelected ? [4, 3] : undefined,
            }));
        }

        // PC number label
        const pcNumber = pc.label.split('-')[1] || pc.label;
        group.add(new Konva.Text({
            x: -half,
            y: half - 11,
            width: size,
            text: pcNumber,
            fontSize: 10,
            fontStyle: 'bold',
            fontFamily: 'monospace',
            fill: fillColor,
            align: 'center',
        }));

        // Interaction
        group.on('click tap', () => this.selectStation(pc));

        group.on('mouseenter', () => {
            document.body.style.cursor = 'pointer';
            group.to({ scaleX: 1.15, scaleY: 1.15, duration: 0.12 });
        });

        group.on('mouseleave', () => {
            document.body.style.cursor = 'default';
            group.to({ scaleX: 1, scaleY: 1, duration: 0.12 });
        });

        return group;
    }

    private darkenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    private getContrastColor(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    private getSeatColor(pc: Computer): string {
        if (pc.status === 'MAINTENANCE') return this.COLORS.maintenance;
        if (this.isMyPc(pc)) return this.COLORS.mine;
        switch (pc.status) {
            case 'AVAILABLE': return this.COLORS.available;
            case 'OCCUPIED': return this.COLORS.occupied;
            default: return this.COLORS.maintenance;
        }
    }

    private updateSeatColors() {
        this.drawMap();
    }

    selectStation(station: Computer) {
        this.selectedStation.set(station);
        this.drawMap();
    }

    private updateSelectedHighlight() {
        this.drawMap();
        this.layer?.batchDraw();
    }

    closeDetails() {
        this.selectedStation.set(null);
        this.updateSelectedHighlight();
    }

    openAdminPage(pc: Computer) {
        this.router.navigate(['/pc-admin', pc.id]);
    }

    get availableCount() {
        return this.stations.filter(s => s.status === 'AVAILABLE').length;
    }

    get occupiedCount() {
        return this.stations.filter(s => s.status === 'OCCUPIED').length;
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
