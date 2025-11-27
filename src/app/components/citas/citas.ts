import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface CitaElement {
  id: number;
  fecha: Date;
  cliente: string;
  artista: string;
  estado: string;
  total: number;
}

@Component({
  selector: 'app-citas',
  standalone: true,
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
  templateUrl: './citas.html',
  styleUrl: './citas.css',
})
export class Citas implements AfterViewInit {
  
  displayedColumns: string[] = ['id', 'fecha', 'cliente', 'artista', 'estado', 'total', 'acciones'];
  
  datosEjemplo: CitaElement[] = [
    { id: 1024, fecha: new Date(), cliente: 'Juan Pérez', artista: 'Alex Ink', estado: 'Confirmada', total: 1500 },
    { id: 1025, fecha: new Date(), cliente: 'Maria Lopez', artista: 'Alex Ink', estado: 'Pendiente', total: 800 },
    { id: 1026, fecha: new Date('2023-11-20'), cliente: 'Carlos Ruiz', artista: 'Sofia Art', estado: 'Finalizada', total: 2500 },
    { id: 1027, fecha: new Date('2023-11-21'), cliente: 'Ana Diaz', artista: 'Sofia Art', estado: 'Cancelada', total: 0 },
    { id: 1028, fecha: new Date(), cliente: 'Luis Gomez', artista: 'Alex Ink', estado: 'Confirmada', total: 1200 },
    { id: 1029, fecha: new Date(), cliente: 'Elena Nito', artista: 'Sofia Art', estado: 'Pendiente', total: 950 },
    { id: 1030, fecha: new Date(), cliente: 'Pedro Pascal', artista: 'Alex Ink', estado: 'Confirmada', total: 3000 },
  ];

  dataSource = new MatTableDataSource<CitaElement>(this.datosEjemplo);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    this.dataSource.filterPredicate = (data: CitaElement, filter: string) => {
      const dataStr = data.cliente + data.artista + data.estado + data.id;
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
}