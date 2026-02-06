import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CPopupData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'c-popup',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './c-popup.html',
  styleUrls: ['./c-popup.scss']
})
export class CPopup {
  constructor(
    public dialogRef: MatDialogRef<CPopup>,
    @Inject(MAT_DIALOG_DATA) public data: CPopupData
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

  get iconName(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      default: return 'info';
    }
  }
}
