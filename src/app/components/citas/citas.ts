import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; 
// 1. IMPORTAR EL SERVICIO RENOMBRADO
import { CitasService } from '../../services/citas-service'; 

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

@Component({
  selector: 'app-citas',
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
  templateUrl: './citas.html',
  styleUrl: './citas.css',
})
export class Citas implements OnInit {
  
  displayedColumns: string[] = ['id', 'fecha', 'cliente', 'artista', 'estado', 'total', 'acciones'];
  dataSource = new MatTableDataSource<any>([]);
  clientes: any[] = [];
  artistas: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // 2. INYECTAR CITAS SERVICE
  constructor(private citasService: CitasService, private router: Router) {}

  ngOnInit() {
    this.cargarCitas();
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.citasService.getClientes().subscribe(data => this.clientes = data);
    this.citasService.getArtistas().subscribe(data => this.artistas = data);
  }

  cargarCitas() {
    // 3. USAR CITAS SERVICE
    this.citasService.getCitas().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => console.error('Error cargando citas:', err)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // 4. FUNCIÓN PARA EL BOTÓN AGENDAR
  irANuevaCita() {
    // Navega a la ruta hija 'nueva' dentro de dashboard/citas
    this.router.navigate(['/dashboard/citas/nueva']);
  }

  verResumen(id: string) {
    this.router.navigate(['/dashboard/citas/resumen', id]);
  }

  // 5. FUNCIÓN PARA ELIMINAR CITA
  eliminarCita(cita: any) {
    if (confirm(`¿Estás seguro de eliminar la cita #${cita.id}?`)) {
      this.citasService.eliminarCita(cita.id).subscribe({
        next: () => {
          console.log('Cita eliminada correctamente');
          this.cargarCitas(); // Recargar la tabla
        },
        error: (err) => console.error('Error eliminando cita:', err)
      });
    }
  }

  // 6. OBTENER NOMBRE COMPLETO DEL CLIENTE
  getNombreCliente(idCliente: string): string {
    const cliente = this.clientes.find(c => c.id === idCliente);
    return cliente ? `${cliente.nombre} ${cliente.apellido}` : 'Desconocido';
  }

  // 7. OBTENER NOMBRE DEL ARTISTA
  getNombreArtista(idArtista: string): string {
    const artista = this.artistas.find(a => a.id === idArtista);
    return artista ? artista.nombre_usuario : 'Desconocido';
  }
}