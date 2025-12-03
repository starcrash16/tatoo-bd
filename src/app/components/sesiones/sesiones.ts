import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CitasService } from '../../services/citas-service'; // Tu servicio

// Material Imports
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './sesiones.html',
  styleUrl: './sesiones.css'
})
export class SesionesComponent implements OnInit {
  
  filterForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id_sesion', 'cita', 'cliente', 'artista', 'fecha', 'estado', 'duracion'];
  
  estadosSesion = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada'];
  artistas: any[] = []; // Llenar con servicio
  clientes: any[] = []; // Llenar con servicio

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private fb: FormBuilder, private citasService: CitasService) {
    this.filterForm = this.fb.group({
      id_cita: [''],
      estado: [''],
      id_artista: [''],
      id_cliente: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.buscar(); // Carga inicial (sin filtros = todo)
  }

  cargarCatalogos() {
    this.citasService.getArtistas().subscribe(data => this.artistas = data);
    this.citasService.getClientes().subscribe(data => this.clientes = data);
  }

  buscar() {
    const filtros = this.filterForm.value;
    
    // Limpieza de strings vacíos a null para que la API entienda
    const filtrosLimprios = Object.keys(filtros).reduce((acc: any, key) => {
      acc[key] = filtros[key] === '' ? null : filtros[key];
      return acc;
    }, {});

    this.citasService.buscarSesiones(filtrosLimprios).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error(err)
    });
  }

  limpiarFiltros() {
    this.filterForm.reset();
    this.buscar();
  }
}