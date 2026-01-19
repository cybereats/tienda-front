import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'c-reset-filters',
    standalone: true,
    imports: [],
    templateUrl: './c-reset-filters.html',
    styleUrl: './c-reset-filters.scss'
})
export class CResetFilters {
    @Input() disabled: boolean = false;
    @Output() reset = new EventEmitter<void>();

    onReset() {
        this.reset.emit();
    }
}
