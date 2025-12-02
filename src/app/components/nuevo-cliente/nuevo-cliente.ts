import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
export class NuevoCliente implements OnInit {
  clienteForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  clienteId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{7,15}$')]], // Valida entre 7 y 15 dígitos
      fecha_nacimiento: ['', Validators.required],
      alergias: [''],
      notas_medicas: ['']
    });
  }

  ngOnInit() {
    // Detectar si estamos en modo edición
    this.clienteId = this.route.snapshot.paramMap.get('id');
    
    if (this.clienteId) {
      this.isEditMode = true;
      this.cargarCliente(this.clienteId);
    }
  }

  cargarCliente(id: string) {
    this.clientesService.getClientePorId(parseInt(id)).subscribe({
      next: (data) => {
        console.log('Datos del cliente cargados:', data);
        
        // Limpiar teléfono de caracteres no numéricos
        const telefonoLimpio = data.telefono ? data.telefono.replace(/\D/g, '') : '';
        
        // Cargar los datos en el formulario
        this.clienteForm.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
          telefono: telefonoLimpio,
          fecha_nacimiento: new Date(data.fecha_nacimiento),
          alergias: data.alergias || '',
          notas_medicas: data.notas_medicas || ''
        });
        
        console.log('Formulario después de patchValue:', this.clienteForm.value);
        console.log('¿Formulario válido?', this.clienteForm.valid);
        console.log('Estado de cada campo:');
        Object.keys(this.clienteForm.controls).forEach(key => {
          const control = this.clienteForm.get(key);
          console.log(`  ${key}: valid=${control?.valid}, value=`, control?.value, 'errors=', control?.errors);
        });
      },
      error: (err) => {
        console.error('Error cargando cliente:', err);
        this.snackBar.open('Error al cargar los datos del cliente', 'Cerrar', { duration: 5000 });
        this.router.navigate(['/dashboard/clientes']);
      }
    });
  }

  onSubmit() {
    if (this.clienteForm.invalid) return;

    this.isSubmitting = true;
    const clienteData = this.clienteForm.value;

    // Modo edición
    if (this.isEditMode && this.clienteId) {
      this.clientesService.editarCliente(parseInt(this.clienteId), clienteData).subscribe({
        next: (res) => {
          this.snackBar.open('¡Cliente actualizado exitosamente!', 'OK', { duration: 3000 });
          this.router.navigate(['/dashboard/clientes']);
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          
          let mensajeError = 'Error al actualizar el cliente.';
          if (err.status === 409) {
            mensajeError = 'El correo electrónico ya está registrado por otro cliente.';
          }
          
          this.snackBar.open(mensajeError, 'Cerrar', { duration: 5000 });
        }
      });
    } else {
      // Modo creación
      this.clientesService.crearCliente(clienteData).subscribe({
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
}