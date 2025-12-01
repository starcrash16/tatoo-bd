import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service'; 

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      identificador: ['', [Validators.required]], // Usuario o Correo
      contrasena: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    const { identificador, contrasena } = this.loginForm.value;

    this.authService.login(identificador, contrasena).subscribe({
      next: (res) => {
        this.isLoading = false;
        // Mensaje de éxito
        this.snackBar.open(`Bienvenido, ${res.usuario.nombre}`, 'OK', { duration: 3000 });
        
        // REDIRECCIÓN AL DASHBOARD
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        
        let mensaje = 'Error al conectar con el servidor';
        if (err.status === 401) mensaje = 'Credenciales incorrectas';
        if (err.status === 403) mensaje = 'Cuenta inactiva';

        this.snackBar.open(mensaje, 'CERRAR', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}