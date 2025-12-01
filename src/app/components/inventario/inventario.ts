import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Para la navegación
// 1. Importamos el servicio
import { InventarioService } from '../../services/inventario-service';

// Material Imports
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

// Interfaz que coincide con la respuesta de tu API (tabla 'materiales')
export interface ProductoElement {
  id: number;
  nombre: string;
  codigo: string;              // SKU
  cantidad_existencia: number; // Nombre exacto de la DB
  nivel_reorden: number;       // Nombre exacto de la DB
  precio_costo: number;        // Nombre exacto de la DB
  activo: boolean;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule,     
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class Inventario implements OnInit, AfterViewInit {
  
  // Las columnas deben coincidir con los 'matColumnDef' de tu HTML
  displayedColumns: string[] = ['codigo', 'nombre', 'stock', 'precio', 'acciones'];
  
  // Inicializamos la tabla vacía
  dataSource = new MatTableDataSource<ProductoElement>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // 2. Inyectamos el servicio y el router
  constructor(
    private inventarioService: InventarioService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarInventario();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // 3. Método para obtener datos del Backend
  cargarInventario() {
    this.inventarioService.getMateriales().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        
        // Configurar filtro personalizado para buscar por varias propiedades
        this.dataSource.filterPredicate = (data: ProductoElement, filter: string) => {
          const dataStr = (data.nombre + data.codigo).toLowerCase();
          return dataStr.indexOf(filter) != -1;
        };

        // Reiniciar paginador si es necesario
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
        if (this.sort) {
          this.dataSource.sort = this.sort;
        }
      },
      error: (err) => console.error('Error cargando inventario:', err)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Navegar al formulario de creación
  irANuevoProducto() {
    this.router.navigate(['/dashboard/inventario/nuevo']);
  }

  // Lógica para el color del badge (Verde, Naranja, Rojo)
  getStockStatus(cantidad: number, reorden: number): string {
    if (cantidad === 0) return 'agotado';
    if (cantidad <= reorden) return 'bajo';
    return 'disponible';
  }

  // Texto para el badge
  getStockLabel(cantidad: number, reorden: number): string {
    if (cantidad === 0) return 'Agotado';
    if (cantidad <= reorden) return 'Bajo Stock';
    return 'Disponible';
  }
}