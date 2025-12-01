import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventarioService } from '../../services/inventario-service';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nuevo-producto',
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
    MatSnackBarModule
  ],
  templateUrl: './nuevo-producto.html',
  styleUrl: './nuevo-producto.css'
})
export class NuevoProducto {
  productoForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      codigo: ['', Validators.required], // SKU
      cantidad_existencia: [0, [Validators.required, Validators.min(0)]],
      nivel_reorden: [5, [Validators.required, Validators.min(1)]], // Alerta de stock bajo
      precio_costo: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit() {
    if (this.productoForm.invalid) return;

    this.isSubmitting = true;
    const nuevoMaterial = this.productoForm.value;

    this.inventarioService.crearMaterial(nuevoMaterial).subscribe({
      next: (res) => {
        this.snackBar.open('¡Material registrado correctamente!', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/inventario']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.snackBar.open('Error al guardar. Verifica que el código no esté repetido.', 'Cerrar');
      }
    });
  }
}