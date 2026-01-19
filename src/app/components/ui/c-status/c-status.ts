import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'c-status',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './c-status.html',
    styleUrl: './c-status.scss'
})
export class CStatus {
    @Input() status!: string;
    @Input() options!: { value: string, label: string, color: string }[];
    @Output() statusChange = new EventEmitter<string>();


    onStatusChange(newStatus: string) {
        this.status = newStatus;
        this.statusChange.emit(this.status);
    }

    getStatusColor(statusValue: string): string {
        return 'c-status--' + this.options.find(o => o.value === statusValue)?.color || 'gray';
    }
}
