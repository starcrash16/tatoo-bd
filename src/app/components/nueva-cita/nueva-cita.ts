import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CitasService } from '../../services/citas-service';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nueva-cita',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './nueva-cita.html',
  styleUrl: './nueva-cita.css'
})
export class NuevaCita implements OnInit {
  citaForm: FormGroup;
  clientes: any[] = [];
  artistas: any[] = [];
  isSubmitting = false;
  usuarioActual: any = null;
  isEditMode = false;
  citaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.citaForm = this.fb.group({
      id_cliente: ['', Validators.required],
      id_artista: ['', Validators.required],
      fecha: [new Date(), Validators.required],
      hora: ['12:00', Validators.required],
      duracion_estimada_minutos: [120, [Validators.required, Validators.min(30)]],
      total_estimado: [0, [Validators.required, Validators.min(0)]],
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarioSesion();
    
    // Detectar si estamos en modo edición
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.citaId = +params['id'];
      }
    });

    // Cargar catálogos (y si es modo edición, cargará la cita después)
    this.cargarCatalogos();
  }

  obtenerUsuarioSesion() {
    const usuarioGuardado = localStorage.getItem('usuario_sesion');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }
  }

  cargarCatalogos() {
    this.citasService.getClientes().subscribe(data => {
      this.clientes = data;
      // Si estamos en modo edición y ya tenemos el ID de la cita, recargar datos
      if (this.isEditMode && this.citaId) {
        this.cargarCita(this.citaId);
      }
    });
    this.citasService.getArtistas().subscribe(data => {
      this.artistas = data;
    });
  }

  cargarCita(id: number) {
    this.citasService.getCitaById(id).subscribe({
      next: (cita) => {
        if (cita) {
          const fechaProgramada = new Date(cita.fecha_programada);
          const hora = fechaProgramada.toTimeString().slice(0, 5); // HH:mm
          
          // Usar setTimeout para asegurar que Angular detecte los cambios
          setTimeout(() => {
            this.citaForm.patchValue({
              id_cliente: cita.id_cliente, // Mantener como string
              id_artista: cita.id_artista, // Mantener como string
              fecha: fechaProgramada,
              hora: hora,
              duracion_estimada_minutos: cita.duracion_estimada_minutos || 120,
              total_estimado: Number(cita.total_estimado),
              notas: cita.notas || ''
            });
          }, 100);
        }
      },
      error: (err) => {
        console.error('Error cargando cita:', err);
        this.snackBar.open('Error al cargar la cita', 'Cerrar');
      }
    });
  }

  onSubmit() {
    if (this.citaForm.invalid) return;
    if (!this.usuarioActual && !this.isEditMode) {
      this.snackBar.open('Error: No se identificó al usuario creador.', 'Cerrar');
      return;
    }

    this.isSubmitting = true;
    const formVal = this.citaForm.value;

    // Combinar fecha y hora para el backend
    const fechaProgramada = new Date(formVal.fecha);
    const [horas, minutos] = formVal.hora.split(':');
    fechaProgramada.setHours(parseInt(horas), parseInt(minutos));

    const payload: any = {
      id_cliente: formVal.id_cliente,
      id_artista: formVal.id_artista,
      fecha_programada: fechaProgramada.toISOString(),
      duracion_estimada_minutos: formVal.duracion_estimada_minutos,
      total_estimado: formVal.total_estimado,
      notas: formVal.notas
    };

    // Solo añadir creado_por al crear nueva cita
    if (!this.isEditMode) {
      payload.creado_por = this.usuarioActual.id;
    }

    const request = this.isEditMode && this.citaId
      ? this.citasService.editarCita(this.citaId, payload)
      : this.citasService.generarCita(payload);

    request.subscribe({
      next: (res) => {
        const mensaje = this.isEditMode ? '¡Cita actualizada con éxito!' : '¡Cita agendada con éxito!';
        this.snackBar.open(mensaje, 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/citas']); // Volver a la lista
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        const mensaje = this.isEditMode ? 'Error al actualizar la cita.' : 'Error al agendar la cita.';
        this.snackBar.open(mensaje + ' Verifique los datos.', 'Cerrar');
      }
    });
  }
}