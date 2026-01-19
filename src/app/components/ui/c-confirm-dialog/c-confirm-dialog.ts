import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'c-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './c-confirm-dialog.html',
  styleUrl: './c-confirm-dialog.scss',
})
export class CConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<CConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) { }
}
