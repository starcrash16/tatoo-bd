import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitasService } from '../../services/citas-service';
import { ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-resumen-cita',
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
  templateUrl: './resumen-cita.html',
  styleUrl: './resumen-cita.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenCita implements OnInit {
  
  cita: any | null = null;
  citaId: string | null = null;
  cargando: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citasService: CitasService,
    private cdr: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.citaId = params.get('id');
      if (this.citaId) {
        this.cargarResumenCita(this.citaId);
      }
    });
  }

  cargarResumenCita(id: string) {
    console.log('Cargando resumen de cita para ID:', id); // Verificar el ID enviado
    this.citasService.getResumenCita(id).subscribe({
      next: (data) => {
        console.log('Respuesta del servidor:', data); // Verificar la respuesta del servidor
        this.cita = data;
        this.cargando = false; // Asegurar que cargando se actualiza
        this.cdr.detectChanges(); // Forzar la detección de cambios
        console.log('Estado de cargando:', this.cargando);
      },
      error: (err) => {
        console.error('Error cargando resumen de cita:', err);
        this.cargando = false; // Asegurar que cargando se actualiza en caso de error
        this.cdr.detectChanges(); // Forzar la detección de cambios
        console.log('Estado de cargando (error):', this.cargando);
      }
    });
  }

  volver() {
    this.router.navigate(['/dashboard/citas']);
  }
}
