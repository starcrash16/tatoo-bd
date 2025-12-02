import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
export class NuevoProducto implements OnInit {
  productoForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  materialId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private inventarioService: InventarioService,
    private router: Router,
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    // Detectar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.materialId = +params['id'];
        this.cargarMaterial(this.materialId);
      }
    });
  }

  cargarMaterial(id: number) {
    this.inventarioService.getMaterialById(id).subscribe({
      next: (material) => {
        if (material) {
          this.productoForm.patchValue({
            nombre: material.nombre,
            codigo: material.codigo,
            cantidad_existencia: material.cantidad_existencia,
            nivel_reorden: material.nivel_reorden,
            precio_costo: material.precio_costo
          });
        }
      },
      error: (err) => {
        console.error('Error cargando material:', err);
        this.snackBar.open('Error al cargar el material', 'Cerrar');
      }
    });
  }

  onSubmit() {
    if (this.productoForm.invalid) return;

    this.isSubmitting = true;
    const materialData = this.productoForm.value;

    const request = this.isEditMode && this.materialId
      ? this.inventarioService.editarMaterial(this.materialId, materialData)
      : this.inventarioService.crearMaterial(materialData);

    request.subscribe({
      next: (res) => {
        const mensaje = this.isEditMode ? '¡Material actualizado correctamente!' : '¡Material registrado correctamente!';
        this.snackBar.open(mensaje, 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/inventario']);
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        const mensaje = this.isEditMode ? 'Error al actualizar.' : 'Error al guardar.';
        this.snackBar.open(mensaje + ' Verifica que el código no esté repetido.', 'Cerrar');
      }
    });
  }
}