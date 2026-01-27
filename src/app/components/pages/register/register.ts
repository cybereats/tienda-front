import { Component } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { AuthService } from '../../../../services/auth.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  registerForm: FormGroup
  isLoading = false
  errorMessage = ''

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      bornDate: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return
    }

    this.isLoading = true
    this.errorMessage = ''

    this.authService.register({ ...this.registerForm.value, role: 'CLIENT' }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token)
        this.router.navigate(['/'])
      },
      error: (error) => {
        this.isLoading = false
        this.errorMessage = error.error?.message || 'Error en el registro. Por favor inténtalo de nuevo.'
        console.error('Registration error:', error)
      },
      complete: () => {
        this.isLoading = false
      }
    })
  }
}
