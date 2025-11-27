import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

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

export interface ProductoElement {
  id: string; // SKU o Código
  nombre: string;
  categoria: string;
  stock: number;
  precioUnitario: number;
  proveedor: string;
}

@Component({
  selector: 'app-inventario',
  imports: [
    CommonModule,
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
export class Inventario implements AfterViewInit {
  
  displayedColumns: string[] = ['id', 'nombre', 'categoria', 'stock', 'precio', 'acciones'];
  
  // Datos simulados de un estudio de tatuajes
  datosEjemplo: ProductoElement[] = [
    { id: 'AG-001', nombre: 'Agujas 3RL (Caja)', categoria: 'Agujas', stock: 15, precioUnitario: 450, proveedor: 'Supply Ink' },
    { id: 'AG-005', nombre: 'Agujas 5RS (Caja)', categoria: 'Agujas', stock: 3, precioUnitario: 450, proveedor: 'Supply Ink' },
    { id: 'TN-BLK', nombre: 'Tinta Negra Dinámica 8oz', categoria: 'Tintas', stock: 8, precioUnitario: 1200, proveedor: 'Eternal Supplies' },
    { id: 'TN-RED', nombre: 'Tinta Roja Intensa 1oz', categoria: 'Tintas', stock: 0, precioUnitario: 350, proveedor: 'Eternal Supplies' },
    { id: 'GT-LAT', nombre: 'Guantes Látex Negro (M)', categoria: 'Higiene', stock: 50, precioUnitario: 200, proveedor: 'CleanSkin' },
    { id: 'CR-REP', nombre: 'Crema Reparadora', categoria: 'Aftercare', stock: 12, precioUnitario: 150, proveedor: 'DermaTattoo' },
    { id: 'PP-TRA', nombre: 'Papel Transfer', categoria: 'Papelería', stock: 100, precioUnitario: 500, proveedor: 'Office Depot' },
    { id: 'MQ-BOB', nombre: 'Máquina Bobinas Clásica', categoria: 'Maquinaria', stock: 1, precioUnitario: 3500, proveedor: 'Iron Works' },
  ];

  dataSource = new MatTableDataSource<ProductoElement>(this.datosEjemplo);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Filtro personalizado
    this.dataSource.filterPredicate = (data: ProductoElement, filter: string) => {
      const dataStr = data.nombre + data.categoria + data.id + data.proveedor;
      return dataStr.toLowerCase().indexOf(filter) != -1;
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Helper para determinar el estado visual del stock
  getStockStatus(stock: number): string {
    if (stock === 0) return 'agotado';
    if (stock <= 5) return 'bajo';
    return 'disponible';
  }

  getStockLabel(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock <= 5) return 'Bajo Stock';
    return 'Disponible';
  }
}