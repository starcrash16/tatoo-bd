import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientesService } from '../../services/clientes-service';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nuevo-cliente',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './nuevo-cliente.html',
  styleUrl: './nuevo-cliente.css'
})
export class NuevoCliente {
  clienteForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]], // Valida 10 dígitos
      fecha_nacimiento: ['', Validators.required],
      alergias: [''],
      notas_medicas: ['']
    });
  }

  onSubmit() {
    if (this.clienteForm.invalid) return;

    this.isSubmitting = true;
    const nuevoCliente = this.clienteForm.value;

    this.clientesService.crearCliente(nuevoCliente).subscribe({
      next: (res) => {
        this.snackBar.open('¡Cliente registrado exitosamente!', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/clientes']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        
        let mensajeError = 'Error al registrar el cliente.';
        if (err.status === 409) {
          mensajeError = 'El correo electrónico ya está registrado.';
        }
        
        this.snackBar.open(mensajeError, 'Cerrar', { duration: 5000 });
      }
    });
  }
}