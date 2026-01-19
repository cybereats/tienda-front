import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'c-search-bar',
    standalone: true,
    imports: [],
    templateUrl: './c-search-bar.html',
    styleUrl: './c-search-bar.scss',
})
export class CSearchBar {
    @Input() placeholder: string = 'Buscar...';
    @Input() value: string = '';
    @Output() search = new EventEmitter<string>();

    onSearch(value: string) {
        this.search.emit(value);
    }
}
