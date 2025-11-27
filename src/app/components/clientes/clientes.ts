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
import { MatChipsModule } from '@angular/material/chips'; // Para los tags de preferencias

export interface ClienteElement {
  id: number;
  nombre: string;
  correo: string;
  telefono: string;
  ultimaVisita: Date;
  totalGastado: number;
  visitas: number; // Cantidad de citas completadas
  estatus: 'VIP' | 'Frecuente' | 'Nuevo' | 'Inactivo';
}

@Component({
  selector: 'app-clientes',
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
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements AfterViewInit {
  
  displayedColumns: string[] = ['nombre', 'contacto', 'historial', 'ultimaVisita', 'estatus', 'acciones'];
  
  datosEjemplo: ClienteElement[] = [
    { id: 1, nombre: 'Juan Pérez', correo: 'juan.perez@mail.com', telefono: '449-123-4567', ultimaVisita: new Date('2023-11-15'), totalGastado: 15500, visitas: 8, estatus: 'VIP' },
    { id: 2, nombre: 'Maria Lopez', correo: 'marialopez@gmail.com', telefono: '449-987-6543', ultimaVisita: new Date('2023-10-05'), totalGastado: 4500, visitas: 3, estatus: 'Frecuente' },
    { id: 3, nombre: 'Carlos Ruiz', correo: 'carlos.r@outlook.com', telefono: '449-555-8888', ultimaVisita: new Date(), totalGastado: 1200, visitas: 1, estatus: 'Nuevo' },
    { id: 4, nombre: 'Ana Diaz', correo: 'ana.d@mail.com', telefono: '449-333-2211', ultimaVisita: new Date('2023-01-20'), totalGastado: 8000, visitas: 5, estatus: 'Inactivo' },
    { id: 5, nombre: 'Roberto Gomez', correo: 'beto.g@gmail.com', telefono: '449-777-1122', ultimaVisita: new Date('2023-11-20'), totalGastado: 25000, visitas: 12, estatus: 'VIP' },
  ];

  dataSource = new MatTableDataSource<ClienteElement>(this.datosEjemplo);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Filtro personalizado
    this.dataSource.filterPredicate = (data: ClienteElement, filter: string) => {
      const dataStr = data.nombre + data.correo + data.estatus;
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

  // Helper para clases CSS según estatus
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}