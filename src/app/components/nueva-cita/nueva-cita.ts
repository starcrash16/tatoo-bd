import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private router: Router,
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
    this.cargarCatalogos();
    this.obtenerUsuarioSesion();
  }

  obtenerUsuarioSesion() {
    const usuarioGuardado = localStorage.getItem('usuario_sesion');
    if (usuarioGuardado) {
      this.usuarioActual = JSON.parse(usuarioGuardado);
    }
  }

  cargarCatalogos() {
    this.citasService.getClientes().subscribe(data => this.clientes = data);
    this.citasService.getArtistas().subscribe(data => this.artistas = data);
  }

  onSubmit() {
    if (this.citaForm.invalid) return;
    if (!this.usuarioActual) {
      this.snackBar.open('Error: No se identificó al usuario creador.', 'Cerrar');
      return;
    }

    this.isSubmitting = true;
    const formVal = this.citaForm.value;

    // Combinar fecha y hora para el backend
    const fechaProgramada = new Date(formVal.fecha);
    const [horas, minutos] = formVal.hora.split(':');
    fechaProgramada.setHours(parseInt(horas), parseInt(minutos));

    const payload = {
      id_cliente: formVal.id_cliente,
      id_artista: formVal.id_artista,
      fecha_programada: fechaProgramada.toISOString(),
      duracion_estimada_minutos: formVal.duracion_estimada_minutos,
      total_estimado: formVal.total_estimado,
      notas: formVal.notas,
      creado_por: this.usuarioActual.id // ID del usuario logueado
    };

    this.citasService.generarCita(payload).subscribe({
      next: (res) => {
        this.snackBar.open('¡Cita agendada con éxito!', 'OK', { duration: 3000 });
        this.router.navigate(['/dashboard/citas']); // Volver a la lista
      },
      error: (err) => {
        console.error(err);
        this.isSubmitting = false;
        this.snackBar.open('Error al agendar la cita. Verifique los datos.', 'Cerrar');
      }
    });
  }
}