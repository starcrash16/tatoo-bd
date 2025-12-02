import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClientesService } from '../../services/clientes-service';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  alergias: string | null;
  notas_medicas: string | null;
}

@Component({
  selector: 'app-expediente-medico',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './expediente-medico.html',
  styleUrl: './expediente-medico.css',
})
export class ExpedienteMedico implements OnInit {
  
  cliente: Cliente | null = null;
  clienteId: string | null = null;
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientesService: ClientesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener el ID del cliente desde la ruta
    this.clienteId = this.route.snapshot.paramMap.get('id');
    console.debug('[ExpedienteMedico] ngOnInit - Param id:', this.clienteId);
    if (this.clienteId) {
      this.cargarCliente(this.clienteId);
    } else {
      console.error('[ExpedienteMedico] No se encontró ID de cliente en la ruta');
      this.router.navigate(['/dashboard/clientes']);
    }
  }

  cargarCliente(id: string) {
    this.cargando = true;
    console.debug('[ExpedienteMedico] cargarCliente - Solicitando cliente con id:', id);
    console.debug('[ExpedienteMedico] Estado antes de petición - cargando:', this.cargando, 'cliente:', this.cliente);
    
    this.clientesService.getClientePorId(parseInt(id)).subscribe({
      next: (data) => {
        console.debug('[ExpedienteMedico] cargarCliente - Respuesta recibida:', data);
        
        if (data && data.id) {
          // Normalizar valores null a strings vacíos para mejor manejo en el template
          this.cliente = {
            ...data,
            alergias: data.alergias || null,
            notas_medicas: data.notas_medicas || null,
            telefono: data.telefono || ''
          };
          this.cargando = false;
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          console.info('[ExpedienteMedico] Cliente cargado correctamente:', this.cliente);
          console.debug('[ExpedienteMedico] Estado después de carga - cargando:', this.cargando, 'cliente existe:', !!this.cliente);
        } else {
          console.warn('[ExpedienteMedico] No se encontró cliente con id:', id, 'Respuesta:', data);
          this.cliente = null;
          this.cargando = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('[ExpedienteMedico] Error cargando cliente:', err);
        this.cargando = false;
        this.cliente = null;
        this.cdr.detectChanges();
        // Redirigir a clientes si no se encuentra
        this.router.navigate(['/dashboard/clientes']);
      }
    });
  }

  volver() {
    this.router.navigate(['/dashboard/clientes']);
  }

  calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  getIniciales(nombre: string, apellido: string): string {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  }
}
