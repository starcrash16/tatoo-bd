import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ComprasService } from '../../services/compras-service';

@Component({
  selector: 'app-nueva-compra',
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
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './nueva-compra.html',
  styleUrl: './nueva-compra.css'
})
export class NuevaCompra implements OnInit {
  form: FormGroup;
  isSubmitting = false;

  proveedores: any[] = [];
  materiales: any[] = [];

  constructor(
    private fb: FormBuilder,
    private comprasService: ComprasService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      id_proveedor: ['', Validators.required],
      numero_factura: ['', Validators.required],
      id_material: ['', Validators.required],
      cantidad: [null, [Validators.required, Validators.min(1)]],
      precio_unitario: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.comprasService.getProveedores().subscribe({
      next: (data) => this.proveedores = data,
      error: (err) => console.error('Error proveedores:', err)
    });

    this.comprasService.getMateriales().subscribe({
      next: (data) => this.materiales = data,
      error: (err) => console.error('Error materiales:', err)
    });
  }

  get totalCalculado(): number {
    const cant = this.form.get('cantidad')?.value || 0;
    const precio = this.form.get('precio_unitario')?.value || 0;
    return cant * precio;
  }

  registrar() {
    if (this.form.invalid) {
      this.snackBar.open('Por favor completa los campos requeridos.', 'OK', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    const val = this.form.value;

    // Payload limpio sin usuarios
    const payload = {
      id_proveedor: Number(val.id_proveedor),
      numero_factura: String(val.numero_factura).trim(),
      total: this.totalCalculado, 
      creado_por: null, // Enviamos null explícitamente
      detalle: {
        id_material: Number(val.id_material),
        cantidad: Number(val.cantidad),
        precio_unitario: Number(val.precio_unitario)
      }
    };

    console.log('Registrando compra:', payload);

    this.comprasService.registrarCompra(payload).subscribe({
      next: (res) => {
        this.snackBar.open('¡Compra registrada exitosamente!', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/compras']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al registrar:', err);
        const mensajeError = err.error?.error || 'Error desconocido.';
        this.snackBar.open(mensajeError, 'Cerrar', { duration: 5000 });
      }
    });
  }
}