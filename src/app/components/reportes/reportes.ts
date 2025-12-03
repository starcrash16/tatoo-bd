import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Servicios
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service';
import { ReportesService } from '../../services/reportes-service';

// PDF Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  reporteForm: FormGroup;
  
  // Listas para los selectores
  listaCitas: any[] = [];
  listaMateriales: any[] = [];
  
  isGenerating = false;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private inventarioService: InventarioService,
    private reportesService: ReportesService, // Inyectamos el servicio de reportes
    private snackBar: MatSnackBar
  ) {
    this.reporteForm = this.fb.group({
      id_cita: ['', Validators.required],
      fecha_reporte: [new Date(), Validators.required],
      materiales_usados: [[], Validators.required],
      observaciones: [''],
      // Campos informativos (solo lectura)
      cliente_nombre: [{value: '', disabled: true}],
      artista_nombre: [{value: '', disabled: true}],
      tipo_trabajo: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.cargarListas();
    
    // Al seleccionar una cita, llamamos al backend para obtener los datos cruzados (JOIN)
    this.reporteForm.get('id_cita')?.valueChanges.subscribe(id => {
      if(id) this.cargarDetalleCompleto(id);
    });
  }

  cargarListas() {
    this.citasService.getCitas().subscribe(data => this.listaCitas = data);
    this.inventarioService.getMateriales().subscribe(data => this.listaMateriales = data);
  }

  // --- AQUÍ ESTÁ LA LÓGICA QUE CUMPLE EL REQUERIMIENTO DE JOIN ---
  cargarDetalleCompleto(idCita: number) {
    this.reporteForm.patchValue({
      cliente_nombre: 'Cargando...',
      artista_nombre: 'Cargando...',
      tipo_trabajo: 'Consultando base de datos...'
    });

    this.reportesService.getDetalleCitaCompleto(idCita).subscribe({
      next: (data) => {
        // Data ya viene con nombres reales gracias al SQL JOIN en el backend
        this.reporteForm.patchValue({
          cliente_nombre: `${data.cliente_nombre} ${data.cliente_apellido}`,
          artista_nombre: `${data.artista_nombre} ${data.artista_apellido}`,
          tipo_trabajo: `Cita #${data.folio} - ${data.estado} (${data.artista_especialidad})`
        });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al obtener detalles de la cita. Verifica que el backend tenga la ruta /api/reportes/cita/:id', 'Cerrar');
        // Reset en caso de error
        this.reporteForm.patchValue({
          cliente_nombre: 'Error',
          artista_nombre: 'Error',
          tipo_trabajo: 'No disponible'
        });
      }
    });
  }

  generarPDF() {
    if (this.reporteForm.invalid) {
      this.snackBar.open('Por favor selecciona una cita y los materiales utilizados.', 'Cerrar');
      return;
    }

    this.isGenerating = true;
    const formValues = this.reporteForm.getRawValue();
    // Filtramos la lista completa de materiales para quedarnos solo con los seleccionados
    const materialesSeleccionados = this.listaMateriales.filter(m => formValues.materiales_usados.includes(m.id));

    const doc = new jsPDF();

    // 1. Encabezado con estilo de marca
    doc.setFillColor(74, 46, 31); // Café #4a2e1f
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(243, 210, 178); // Crema #f3d2b2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('GANGSTER TATTOO STUDIO', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('REPORTE OPERATIVO CONSOLIDADO', 105, 30, { align: 'center' });

    // 2. Información General
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${formValues.fecha_reporte.toLocaleDateString()}`, 14, 50);
    doc.text(`Folio Cita: #${formValues.id_cita}`, 150, 50);

    doc.setDrawColor(74, 46, 31);
    doc.line(14, 55, 196, 55);

    // 3. Detalles del Servicio (Datos obtenidos del JOIN)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL SERVICIO', 14, 65);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Cliente: ${formValues.cliente_nombre}`, 14, 75);
    doc.text(`Artista Encargado: ${formValues.artista_nombre}`, 14, 82);
    doc.text(`Descripción: ${formValues.tipo_trabajo}`, 14, 89);

    // 4. Tabla de Materiales Utilizados
    doc.setFont('helvetica', 'bold');
    doc.text('MATERIALES UTILIZADOS', 14, 105);

    // Preparamos los datos para autoTable
    const tableData = materialesSeleccionados.map(m => [
      m.codigo, 
      m.nombre, 
      '1 Unidad', // Dato estimado
      `$${m.precio_costo}`
    ]);

    autoTable(doc, {
      startY: 110,
      head: [['SKU', 'Material', 'Cantidad', 'Costo Unit.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [74, 46, 31], textColor: [243, 210, 178] }, // Colores de marca
      styles: { fontSize: 9 }
    });

    // 5. Observaciones y Firmas
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    // splitTextToSize ajusta el texto largo para que no se salga de la página
    const observacionesLines = doc.splitTextToSize(formValues.observaciones || 'Sin observaciones adicionales.', 180);
    doc.text(observacionesLines, 14, finalY + 7);

    // Espacio para firmas
    const firmaY = finalY + 40;
    doc.setLineWidth(0.5);
    doc.line(30, firmaY, 90, firmaY);
    doc.text('Firma del Artista', 45, firmaY + 5);

    doc.line(120, firmaY, 180, firmaY);
    doc.text('Conformidad del Cliente', 130, firmaY + 5);

    // Guardar el archivo
    doc.save(`Reporte_Gangster_Cita_${formValues.id_cita}.pdf`);
    
    this.isGenerating = false;
    this.snackBar.open('PDF Generado correctamente', 'OK', { duration: 3000 });
  }
}