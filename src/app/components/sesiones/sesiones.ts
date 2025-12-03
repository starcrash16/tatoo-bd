import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// Servicios
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service'; // <--- IMPORTAR

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
import { MatDividerModule } from '@angular/material/divider'; // <--- Para separar visualmente

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
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './sesiones.html',
  styleUrl: './sesiones.css'
})
export class SesionesComponent implements OnInit {
  
  // --- SECCIÓN 1: SESIONES ---
  filterForm: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['id_sesion', 'cita', 'cliente', 'artista', 'fecha', 'estado'];
  
  estadosSesion = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada'];
  artistas: any[] = [];
  clientes: any[] = [];

  @ViewChild('paginatorSesiones') paginatorSesiones!: MatPaginator; // Renombrado para evitar conflicto
  @ViewChild(MatSort) sort!: MatSort;

  // --- SECCIÓN 2: MATERIALES ---
  materialForm: FormGroup;
  dataSourceMateriales = new MatTableDataSource<any>([]);
  displayedColumnsMateriales: string[] = ['id', 'sesion', 'material', 'cantidad', 'costo', 'subtotal', 'notas'];
  listaMateriales: any[] = [];

  @ViewChild('paginatorMateriales') paginatorMateriales!: MatPaginator; // Segundo paginador

  constructor(
    private fb: FormBuilder, 
    private citasService: CitasService,
    private inventarioService: InventarioService // <--- Inyectar
  ) {
    // Formulario Sesiones
    this.filterForm = this.fb.group({
      id_cita: [''],
      estado: [''],
      id_artista: [''],
      id_cliente: ['']
    });

    // Formulario Materiales
    this.materialForm = this.fb.group({
      id_sesion: [''],
      id_material: ['']
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.buscarSesiones();    // Carga inicial tabla 1
    this.buscarMateriales();  // Carga inicial tabla 2
  }

  cargarCatalogos() {
    this.citasService.getArtistas().subscribe(data => this.artistas = data);
    this.citasService.getClientes().subscribe(data => this.clientes = data);
    
    // Cargar inventario para el filtro de materiales
    this.inventarioService.getMateriales().subscribe(data => this.listaMateriales = data);
  }

  // --- LÓGICA SESIONES ---
  buscarSesiones() {
    const filtros = this.filterForm.value;
    const filtrosLimpios = Object.keys(filtros).reduce((acc: any, key) => {
      acc[key] = filtros[key] === '' ? null : filtros[key];
      return acc;
    }, {});

    this.citasService.buscarSesiones(filtrosLimpios).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginatorSesiones;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error(err)
    });
  }

  limpiarFiltrosSesiones() {
    this.filterForm.reset();
    this.buscarSesiones();
  }

  // --- LÓGICA MATERIALES ---
  buscarMateriales() {
    const filtrosRaw = this.materialForm.value;
    const filtros = {
      id_sesion: filtrosRaw.id_sesion || null,
      id_material: filtrosRaw.id_material || null
    };

    this.inventarioService.getMaterialesSesion(filtros).subscribe({
      next: (data) => {
        this.dataSourceMateriales.data = data;
        this.dataSourceMateriales.paginator = this.paginatorMateriales;
      },
      error: (err) => console.error('Error buscando materiales:', err)
    });
  }

  limpiarFiltrosMateriales() {
    this.materialForm.reset();
    this.buscarMateriales();
  }
}