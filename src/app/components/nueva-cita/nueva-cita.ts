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
  
  // 1. DEFINIR LISTA DE ESTADOS (Basado en tu ENUM de PostgreSQL)
  estadosCita: string[] = [
    'programada', 
    'confirmada', 
    'en_progreso', 
    'completada', 
    'cancelada', 
    'no_asistio'
  ];

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
      notas: [''],
      // 2. AGREGAR CONTROL DE ESTADO (Por defecto 'programada')
      estado: ['programada', Validators.required] 
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
          const hora = fechaProgramada.toTimeString().slice(0, 5); 
          
          setTimeout(() => {
            this.citaForm.patchValue({
              id_cliente: cita.id_cliente, 
              id_artista: cita.id_artista, 
              fecha: fechaProgramada,
              hora: hora,
              duracion_estimada_minutos: cita.duracion_estimada_minutos || 120,
              total_estimado: Number(cita.total_estimado),
              notas: cita.notas || '',
              // 3. CARGAR EL ESTADO ACTUAL
              estado: cita.estado 
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
    
    // ... validación de usuario ...

    this.isSubmitting = true;
    const formVal = this.citaForm.value;

    const fechaProgramada = new Date(formVal.fecha);
    const [horas, minutos] = formVal.hora.split(':');
    fechaProgramada.setHours(parseInt(horas), parseInt(minutos));

    const payload: any = {
      id_cliente: formVal.id_cliente,
      id_artista: formVal.id_artista,
      fecha_programada: fechaProgramada.toISOString(),
      duracion_estimada_minutos: formVal.duracion_estimada_minutos,
      total_estimado: formVal.total_estimado,
      notas: formVal.notas,
      // 4. INCLUIR EL ESTADO EN EL ENVÍO
      // El backend (Trigger) detectará si cambió y creará la sesión automáticamente.
      estado: formVal.estado 
    };

    if (!this.isEditMode) {
      payload.creado_por = this.usuarioActual.id;
      // Al crear, forzamos 'programada' aunque el form tenga otro valor, 
      // o dejamos que el backend lo maneje.
      payload.estado = 'programada'; 
    }

    const request = this.isEditMode && this.citaId
      ? this.citasService.editarCita(this.citaId, payload)
      : this.citasService.generarCita(payload);

    request.subscribe({
      next: (res) => {
        // ... manejo de éxito ...
        this.snackBar.open(this.isEditMode ? 'Actualización exitosa' : 'Cita creada', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/citas']);
      },
      error: (err) => {
        // ... manejo de error ...
        this.isSubmitting = false;
        this.snackBar.open('Error en la operación', 'Cerrar');
      }
    });
  }
}