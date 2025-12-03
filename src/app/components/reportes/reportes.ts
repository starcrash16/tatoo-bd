import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Servicios
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service';
import { ReportesService } from '../../services/reportes-service';

// Material Modules (Solo Módulos en los imports del componente)
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

// PDF Libraries
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interfaz para el reporte financiero (ROLLUP)
export interface FinancieroRow {
  mes: string | null;
  artista: string | null;
  total_ingresos: number;
  cantidad_citas: number;
}

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
    MatSnackBarModule,
    MatTableModule,      // Importante: Aquí va el módulo, no el DataSource
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  reporteForm: FormGroup;
  
  // Listas para el formulario
  listaCitas: any[] = [];
  listaMateriales: any[] = [];
  isGenerating = false;

  // --- TABLA ROLLUP (Finanzas) ---
  // MatTableDataSource se instancia aquí, dentro de la clase
  dataSourceRollup = new MatTableDataSource<FinancieroRow>([]);
  displayedColumnsRollup: string[] = ['mes', 'artista', 'citas', 'ingresos'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private inventarioService: InventarioService,
    private reportesService: ReportesService,
    private snackBar: MatSnackBar
  ) {
    this.reporteForm = this.fb.group({
      id_cita: ['', Validators.required],
      fecha_reporte: [new Date(), Validators.required],
      materiales_usados: [[], Validators.required],
      observaciones: [''],
      cliente_nombre: [{value: '', disabled: true}],
      artista_nombre: [{value: '', disabled: true}],
      tipo_trabajo: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.cargarListas();
    
    // Al seleccionar una cita, cargar sus detalles automáticamente
    this.reporteForm.get('id_cita')?.valueChanges.subscribe(id => {
      if(id) this.cargarDetalleCompleto(id);
    });

    // Cargar la tabla financiera automáticamente
    this.cargarReporteFinanciero();
  }

  cargarListas() {
    this.citasService.getCitas().subscribe(data => this.listaCitas = data);
    this.inventarioService.getMateriales().subscribe(data => this.listaMateriales = data);
  }

  // --- LÓGICA REPORTE FINANCIERO (ROLLUP) ---
  cargarReporteFinanciero() {
    this.reportesService.getReporteFinancieroRollup().subscribe({
      next: (data) => {
        this.dataSourceRollup.data = data;
        if(this.paginator) {
          this.dataSourceRollup.paginator = this.paginator;
        }
      },
      error: (err) => console.error('Error cargando finanzas:', err)
    });
  }

  // Helpers para identificar filas de subtotales/totales
  isSubtotal(row: FinancieroRow): boolean {
    return row.artista === null && row.mes !== null;
  }

  isGrandTotal(row: FinancieroRow): boolean {
    return row.mes === null && row.artista === null;
  }

  // --- LÓGICA PDF ---
  cargarDetalleCompleto(idCita: number) {
    this.reporteForm.patchValue({ cliente_nombre: 'Cargando...', artista_nombre: 'Cargando...', tipo_trabajo: '...' });
    
    this.reportesService.getDetalleCitaCompleto(idCita).subscribe({
      next: (data) => {
        this.reporteForm.patchValue({
          cliente_nombre: `${data.cliente_nombre} ${data.cliente_apellido}`,
          artista_nombre: `${data.artista_nombre} ${data.artista_apellido}`,
          tipo_trabajo: `Cita #${data.folio} - ${data.estado}`
        });
      },
      error: () => this.snackBar.open('Error al cargar detalles de la cita', 'Cerrar')
    });
  }

  generarPDF() {
    if (this.reporteForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos requeridos', 'Cerrar');
      return;
    }

    this.isGenerating = true;
    const formValues = this.reporteForm.getRawValue();
    
    // Filtramos para obtener los objetos completos de los materiales seleccionados
    const materialesSeleccionados = this.listaMateriales.filter(m => formValues.materiales_usados.includes(m.id));

    const doc = new jsPDF();

    // 1. Encabezado con estilo de marca (Café)
    doc.setFillColor(74, 46, 31); // #4a2e1f
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(243, 210, 178); // #f3d2b2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('GANGSTER TATTOO STUDIO', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('ACTA DE SERVICIO Y MATERIALES', 105, 30, { align: 'center' });

    // 2. Información General
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha: ${formValues.fecha_reporte.toLocaleDateString()}`, 14, 50);
    doc.text(`Folio Cita: #${formValues.id_cita}`, 150, 50);

    doc.setDrawColor(74, 46, 31);
    doc.line(14, 55, 196, 55);

    // 3. Detalles del Servicio
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL SERVICIO', 14, 65);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Cliente: ${formValues.cliente_nombre}`, 14, 75);
    doc.text(`Artista: ${formValues.artista_nombre}`, 14, 82);
    doc.text(`Descripción: ${formValues.tipo_trabajo}`, 14, 89);

    // 4. Tabla de Materiales (jspdf-autotable)
    doc.setFont('helvetica', 'bold');
    doc.text('MATERIALES CONSUMIDOS', 14, 105);

    const tableData = materialesSeleccionados.map(m => [
      m.codigo, 
      m.nombre, 
      '1 Unidad', 
      `$${m.precio_costo}`
    ]);

    autoTable(doc, {
      startY: 110,
      head: [['SKU', 'Material', 'Cantidad', 'Costo Est.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [74, 46, 31], textColor: [243, 210, 178] },
      styles: { fontSize: 9 }
    });

    // 5. Observaciones
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    const observacionesLines = doc.splitTextToSize(formValues.observaciones || 'Sin observaciones.', 180);
    doc.text(observacionesLines, 14, finalY + 7);

    // 6. Firmas
    const firmaY = finalY + 40;
    doc.setLineWidth(0.5);
    doc.line(30, firmaY, 90, firmaY);
    doc.text('Firma del Artista', 45, firmaY + 5);

    doc.line(120, firmaY, 180, firmaY);
    doc.text('Firma del Cliente', 135, firmaY + 5);

    // Guardar archivo real
    doc.save(`Reporte_Cita_${formValues.id_cita}.pdf`);
    
    this.isGenerating = false;
    this.snackBar.open('PDF descargado exitosamente', 'OK', { duration: 3000 });
  }
}