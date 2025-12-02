import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// 1. IMPORTAR SERVICIO
import { ClientesService } from '../../services/clientes-service';

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

export interface ClienteElement {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  // Campos opcionales calculados o futuros
  totalGastado?: number;
  visitas?: number;
  estatus?: 'VIP' | 'Frecuente' | 'Nuevo' | 'Inactivo';
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Para routerLink
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
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit, AfterViewInit {
  
  // Ajustamos columnas según lo que necesitamos mostrar en el HTML
  displayedColumns: string[] = ['nombre', 'contacto', 'nacimiento', 'acciones'];
  
  dataSource = new MatTableDataSource<ClienteElement>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // 2. INYECTAR SERVICIO Y ROUTER
  constructor(
    private clientesService: ClientesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargarClientes() {
    this.clientesService.getClientes().subscribe({
      next: (data) => {
        // Asignamos los datos que vienen del backend
        this.dataSource.data = data;
        
        // Filtro personalizado para buscar por nombre, apellido o correo
        this.dataSource.filterPredicate = (data: ClienteElement, filter: string) => {
          const dataStr = (data.nombre + data.apellido + data.correo).toLowerCase();
          return dataStr.indexOf(filter) != -1;
        };
      },
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // 3. NAVEGAR A NUEVO CLIENTE (Conectado al botón)
  irANuevoCliente() {
    this.router.navigate(['/dashboard/clientes/nuevo']);
  }

  // 4. ELIMINAR CLIENTE
  eliminarCliente(cliente: ClienteElement) {
    const confirmar = confirm(
      `¿Está seguro de que desea eliminar al cliente ${cliente.nombre} ${cliente.apellido}?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmar) {
      this.clientesService.eliminarCliente(cliente.id).subscribe({
        next: () => {
          console.log('Cliente eliminado exitosamente');
          this.cargarClientes(); // Recargar la tabla
        },
        error: (err) => {
          console.error('Error eliminando cliente:', err);
          alert('Error al eliminar el cliente. Por favor, intente nuevamente.');
        }
      });
    }
  }
}