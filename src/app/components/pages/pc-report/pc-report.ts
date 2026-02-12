import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../../../../services/report.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
    selector: 'pc-report',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './pc-report.html',
    styleUrl: './pc-report.scss'
})
export class PcReport implements OnInit {
    private fb = inject(FormBuilder);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private reportService = inject(ReportService);
    private authService = inject(AuthService);

    reportForm: FormGroup = this.fb.group({
        subject: ['', [Validators.required, Validators.minLength(5)]],
        priority: [2, Validators.required],
        description: ['', [Validators.required, Validators.minLength(10)]]
    });

    pcId: number = 0;
    isLoading = false;
    successMessage = '';
    errorMessage = '';

    ngOnInit() {
        this.pcId = Number(this.route.snapshot.paramMap.get('pcId'));
        if (!this.pcId) {
            this.router.navigate(['/computers']);
        }
    }

    onSubmit() {
        if (this.reportForm.invalid) {
            this.reportForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';

        const reportData = {
            subject: this.reportForm.value.subject,
            priority: this.reportForm.value.priority,
            description: this.reportForm.value.description,
            pcId: this.pcId,
            userId: this.authService.getUser()?.id
        };

        this.reportService.post<any>(reportData).subscribe({
            next: () => {
                this.successMessage = 'Incidencia reportada correctamente. Redirigiendo...';
                setTimeout(() => {
                    this.router.navigate(['/pc-admin', this.pcId]);
                }, 2000);
            },
            error: (err) => {
                console.error('Error reporting incident:', err);
                this.errorMessage = 'Hubo un error al enviar el reporte. Por favor, inténtalo de nuevo.';
                this.isLoading = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/pc-admin', this.pcId]);
    }
}
