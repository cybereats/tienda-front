import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'c-pagination',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './c-pagination.html',
    styleUrl: './c-pagination.scss',
})
export class CPagination {
    @Input() currentPage: number = 1;
    @Input() totalPages: number = 1;
    @Input() size: number = 10;
    @Input() route: string = '';
    @Input() queryParams: any = {};

    get pages(): number[] {
        const total = this.totalPages;
        const current = this.currentPage;
        const range: number[] = [];

        let start: number;
        let end: number;

        if (current === 1) {
            start = 1;
            end = Math.min(3, total);
        } else if (current === total) {
            start = Math.max(1, total - 2);
            end = total;
        } else {
            start = current - 1;
            end = current + 1;
        }

        for (let i = start; i <= end; i++) {
            if (i > 0 && i <= total) {
                range.push(i);
            }
        }

        return range;
    }
}
