import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// Servicios
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service';
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
  
  // Catálogos
  listaCitas: any[] = [];
  listaMateriales: any[] = [];
  
  isGenerating = false;

  constructor(
    private fb: FormBuilder,
    private citasService: CitasService,
    private inventarioService: InventarioService,
    private snackBar: MatSnackBar
  ) {
    this.reporteForm = this.fb.group({
      id_cita: ['', Validators.required],
      fecha_reporte: [new Date(), Validators.required],
      materiales_usados: [[], Validators.required], // Multi-select
      observaciones: [''],
      // Datos informativos (solo lectura en el form)
      cliente_nombre: [{value: '', disabled: true}],
      artista_nombre: [{value: '', disabled: true}],
      tipo_trabajo: [{value: '', disabled: true}]
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    
    // Escuchar cambios en la cita para autocompletar datos
    this.reporteForm.get('id_cita')?.valueChanges.subscribe(id => {
      this.autocompletarDatosCita(id);
    });
  }

  cargarDatos() {
    // Cargar Citas
    this.citasService.getCitas().subscribe({
      next: (data) => this.listaCitas = data,
      error: (err) => console.error(err)
    });

    // Cargar Materiales
    this.inventarioService.getMateriales().subscribe({
      next: (data) => this.listaMateriales = data,
      error: (err) => console.error(err)
    });
  }

  autocompletarDatosCita(idCita: number) {
    const citaSeleccionada = this.listaCitas.find(c => c.id === idCita);
    if (citaSeleccionada) {
      // Aquí simulamos datos si el backend solo devuelve IDs. 
      // Idealmente tu backend devolvería nombres en un JOIN.
      this.reporteForm.patchValue({
        cliente_nombre: `Cliente ID: ${citaSeleccionada.id_cliente}`, // Ajustar si tienes el nombre real
        artista_nombre: `Artista ID: ${citaSeleccionada.id_artista}`,
        tipo_trabajo: `Cita #${citaSeleccionada.id} - ${citaSeleccionada.estado}`
      });
    }
  }

  generarPDF() {
    if (this.reporteForm.invalid) {
      this.snackBar.open('Por favor completa los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isGenerating = true;
    const formValues = this.reporteForm.getRawValue(); // rawValue incluye los disabled
    const materialesSeleccionados = this.listaMateriales.filter(m => formValues.materiales_usados.includes(m.id));

    // --- LÓGICA DE GENERACIÓN PDF ---
    const doc = new jsPDF();

    // 1. Encabezado Estilo Gangster
    doc.setFillColor(74, 46, 31); // Café #4a2e1f
    doc.rect(0, 0, 210, 40, 'F'); // Barra superior
    
    doc.setTextColor(243, 210, 178); // Crema #f3d2b2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('GANGSTER TATTOO STUDIO', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('REPORTE OPERATIVO DE SESIÓN', 105, 30, { align: 'center' });

    // 2. Información General
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${formValues.fecha_reporte.toLocaleDateString()}`, 14, 50);
    doc.text(`Folio Cita: #${formValues.id_cita}`, 150, 50);

    doc.setDrawColor(74, 46, 31);
    doc.line(14, 55, 196, 55); // Línea divisora

    // 3. Detalles de la Sesión
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DEL SERVICIO', 14, 65);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Cliente: ${formValues.cliente_nombre}`, 14, 75);
    doc.text(`Artista Encargado: ${formValues.artista_nombre}`, 14, 82);
    doc.text(`Descripción: ${formValues.tipo_trabajo}`, 14, 89);

    // 4. Tabla de Materiales Usados
    doc.setFont('helvetica', 'bold');
    doc.text('MATERIALES UTILIZADOS', 14, 105);

    const tableData = materialesSeleccionados.map(m => [
      m.codigo,
      m.nombre,
      '1 Unidad (Estimado)', // Aquí podrías pedir cantidad en el form si quisieras
      `$${m.precio_costo}`
    ]);

    autoTable(doc, {
      startY: 110,
      head: [['SKU', 'Material', 'Cantidad', 'Costo Unit.']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [74, 46, 31], textColor: [243, 210, 178] }, // Estilo Gangster
      styles: { fontSize: 9 }
    });

    // 5. Observaciones y Firmas
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(formValues.observaciones || 'Sin observaciones adicionales.', 14, finalY + 7);

    // Líneas de firma
    doc.line(30, 270, 90, 270);
    doc.text('Firma del Artista', 45, 275);

    doc.line(120, 270, 180, 270);
    doc.text('Conformidad del Cliente', 130, 275);

    // Guardar
    doc.save(`Reporte_Cita_${formValues.id_cita}.pdf`);
    
    this.isGenerating = false;
    this.snackBar.open('PDF Generado correctamente', 'OK', { duration: 3000 });
  }
}