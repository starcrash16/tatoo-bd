import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service'; // <--- IMPORTAR

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider'; // <--- Para separar secciones
import { MatListModule } from '@angular/material/list';

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
    MatSnackBarModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './nueva-cita.html',
  styleUrl: './nueva-cita.css'
})
export class NuevaCita implements OnInit {
  citaForm: FormGroup;
  
  // Catálogos
  clientes: any[] = [];
  artistas: any[] = [];
  listaMateriales: any[] = []; // Inventario completo
  
  // Listas simuladas para diseño (Deberían venir de un servicio)
  categoriasDiseno: any[] = [
    { id: 1, nombre: 'Blackwork' },
    { id: 2, nombre: 'Realismo' },
    { id: 3, nombre: 'Neotradicional' },
    { id: 4, nombre: 'Acuarela' },
    { id: 5, nombre: 'Mandala' }
  ];
  
  // Lista local para materiales seleccionados en el formulario
  materialesSeleccionados: any[] = []; 
  
  // Control auxiliar para selección de material
  materialControl = new FormControl('');
  cantidadMaterialControl = new FormControl(1);

  estadosCita: string[] = ['programada', 'confirmada', 'en_progreso', 'completada', 'cancelada', 'no_asistio'];

  isSubmitting = false;
  usuarioActual: any = null;
  isEditMode = false;
  citaId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private inventarioService: InventarioService, // <--- INYECTAR
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.citaForm = this.fb.group({
      id_cliente: ['', Validators.required],
      id_artista: ['', Validators.required],
      fecha: [new Date(), Validators.required],
      hora: ['12:00', Validators.required],
      estado: ['programada', Validators.required],
      notas: [''],
      
      // Campos Condicionales (Inicialmente sin validación requerida)
      duracion_estimada_minutos: [120], 
      total_estimado: [0],
      
      // Campos para CONFIRMADA (Diseño)
      id_categoria_diseno: [''],
      id_diseno: [''], // Podría ser un input o select
      cantidad_diseno: [1],

      // El array de materiales lo manejaremos manualmente en materialesSeleccionados
    });
  }

  ngOnInit(): void {
    this.obtenerUsuarioSesion();
    
    // Escuchar cambios de estado para mostrar/ocultar campos
    this.citaForm.get('estado')?.valueChanges.subscribe(estado => {
      this.actualizarValidaciones(estado);
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.citaId = +params['id'];
      }
    });

    this.cargarCatalogos();
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
    
    // Cargar inventario para la sección "en_progreso"
    this.inventarioService.getMateriales().subscribe(data => this.listaMateriales = data);

    if (this.isEditMode && this.citaId) {
      this.cargarCita(this.citaId);
    }
  }

  cargarCita(id: number) {
    this.citasService.getCitaById(id).subscribe({
      next: (cita) => {
        if (cita) {
          const fechaProgramada = new Date(cita.fecha_programada);
          const hora = fechaProgramada.toTimeString().slice(0, 5);
          
          this.citaForm.patchValue({
            id_cliente: cita.id_cliente,
            id_artista: cita.id_artista,
            fecha: fechaProgramada,
            hora: hora,
            estado: cita.estado,
            duracion_estimada_minutos: cita.duracion_estimada_minutos,
            total_estimado: Number(cita.total_estimado),
            notas: cita.notas
          });
          
          // Disparar validaciones iniciales según el estado cargado
          this.actualizarValidaciones(cita.estado);
        }
      },
      error: (err) => console.error(err)
    });
  }

  // --- LÓGICA DINÁMICA DE CAMPOS ---
  actualizarValidaciones(estado: string) {
    const duracionCtrl = this.citaForm.get('duracion_estimada_minutos');
    const totalCtrl = this.citaForm.get('total_estimado');
    const catDisenoCtrl = this.citaForm.get('id_categoria_diseno');

    // Resetear validadores
    duracionCtrl?.clearValidators();
    totalCtrl?.clearValidators();
    catDisenoCtrl?.clearValidators();

    switch (estado) {
      case 'programada':
        // No requiere nada extra
        break;

      case 'confirmada':
        catDisenoCtrl?.setValidators(Validators.required);
        break;

      case 'en_progreso':
      case 'completada':
        duracionCtrl?.setValidators([Validators.required, Validators.min(1)]);
        totalCtrl?.setValidators([Validators.required, Validators.min(0)]);
        break;
        
      case 'no_asistio':
      case 'cancelada':
        // Nada requerido
        break;
    }

    duracionCtrl?.updateValueAndValidity();
    totalCtrl?.updateValueAndValidity();
    catDisenoCtrl?.updateValueAndValidity();
  }

  // --- LÓGICA DE MATERIALES ---
  agregarMaterial() {
    const materialId = this.materialControl.value;
    const cantidadSolicitada = this.cantidadMaterialControl.value;

    if (!materialId || !cantidadSolicitada || cantidadSolicitada <= 0) return;

    const materialObj = this.listaMateriales.find(m => m.id === materialId);
    
    if (!materialObj) return;

    // --- VALIDACIÓN DE STOCK (NUEVO) ---
    // Calculamos cuánto ya hemos "apartado" en la lista temporal
    const existenteEnLista = this.materialesSeleccionados.find(m => m.id === materialId);
    const cantidadYaSeleccionada = existenteEnLista ? existenteEnLista.cantidad : 0;
    
    const totalRequerido = cantidadYaSeleccionada + cantidadSolicitada;

    // Convertimos a número por seguridad (el backend devuelve strings numéricos a veces)
    const stockReal = Number(materialObj.cantidad_existencia);

    if (totalRequerido > stockReal) {
      const mensaje = existenteEnLista 
        ? `❌ Stock insuficiente. Ya seleccionó ${cantidadYaSeleccionada} unidades. Solo hay ${stockReal} disponibles de "${materialObj.nombre}".`
        : `❌ Stock insuficiente. Solo hay ${stockReal} unidades disponibles de "${materialObj.nombre}".`;
      
      this.snackBar.open(mensaje, 'Entendido', { 
        duration: 6000, 
        panelClass: ['error-snackbar'] 
      });
      return; // DETENEMOS LA EJECUCIÓN AQUÍ
    }
    // -----------------------------------

    // Si pasa la validación, agregamos a la lista
    if (existenteEnLista) {
      existenteEnLista.cantidad += cantidadSolicitada;
    } else {
      this.materialesSeleccionados.push({
        id: materialId,
        nombre: materialObj.nombre,
        codigo: materialObj.codigo,
        cantidad: cantidadSolicitada
      });
    }

    // Reset inputs
    this.materialControl.setValue('');
    this.cantidadMaterialControl.setValue(1);
  }

  eliminarMaterial(index: number) {
    this.materialesSeleccionados.splice(index, 1);
  }

  // --- SUBMIT ---
  onSubmit() {
    if (this.citaForm.invalid) {
      this.snackBar.open('⚠️ Formulario inválido. Por favor, revise los campos requeridos.', 'Cerrar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.citaForm.controls).forEach(key => {
        this.citaForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formVal = this.citaForm.value;
    const fechaProgramada = new Date(formVal.fecha);
    const [horas, minutos] = formVal.hora.split(':');
    fechaProgramada.setHours(parseInt(horas), parseInt(minutos));

    // Construir Payload base
    const payload: any = {
      id_cliente: formVal.id_cliente,
      id_artista: formVal.id_artista,
      fecha_programada: fechaProgramada.toISOString(),
      notas: formVal.notas,
      usuario_id: this.usuarioActual?.id || 1, // <--- AGREGAR ESTO
      estado: formVal.estado
    };

    // Añadir datos según estado
    if (['en_progreso', 'completada'].includes(formVal.estado)) {
      payload.duracion_estimada_minutos = formVal.duracion_estimada_minutos;
      payload.total_estimado = formVal.total_estimado;
      
      // Aquí enviarías los materiales a tu backend (o llamarías al endpoint de inventario por separado)
      if (formVal.estado === 'en_progreso') {
        payload.materiales = this.materialesSeleccionados;
      }
    }

    if (formVal.estado === 'confirmada') {
      payload.detalles_diseno = {
        id_categoria: formVal.id_categoria_diseno,
        cantidad: formVal.cantidad_diseno
      };
    }

    if (!this.isEditMode) {
      payload.creado_por = this.usuarioActual?.id || 1;
    }

    const request = this.isEditMode && this.citaId
      ? this.citasService.editarCita(this.citaId, payload)
      : this.citasService.generarCita(payload);

    request.subscribe({
      next: () => {
        const mensaje = this.isEditMode 
          ? '✅ Cita actualizada exitosamente'
          : '✅ Cita creada exitosamente';
        this.snackBar.open(mensaje, 'OK', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/dashboard/citas']);
      },
      error: (err) => {
        this.isSubmitting = false;
        const mensaje = err?.error?.message || 'Error al procesar la solicitud. Intente nuevamente.';
        this.snackBar.open(`❌ ${mensaje}`, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Error al guardar cita:', err);
      }
    });
  }
}