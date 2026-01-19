import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
    value: string;
    label: string;
}

@Component({
    selector: 'c-filter-select',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './c-filter-select.html',
    styleUrl: './c-filter-select.scss',
})
export class CFilterSelect {
    @Input() options: FilterOption[] = [];
    @Input() placeholder: string = 'Seleccionar...';
    @Input() value: string = '';
    @Output() valueChange = new EventEmitter<string>();

    onChange(newValue: string) {
        this.value = newValue;
        this.valueChange.emit(newValue);
    }
}
