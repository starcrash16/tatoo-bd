import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Servicios
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service';
import { PagosService } from '../../services/pagos-service';
import { ReportesService } from '../../services/reportes-service';
import { FuncionesResumenService } from '../../services/funciones-resumen-service';

// Material & Charts
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    BaseChartDirective
  ],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
  
  // Usamos ViewChildren para poder actualizar TODAS las gráficas (Barra y Dona)
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

  kpis = [
    { titulo: 'Citas Hoy', valor: '0', icono: 'today', color: '#3f51b5' },
    { titulo: 'Ingresos Mes', valor: '$0', icono: 'attach_money', color: 'green' },
    { titulo: 'Material Bajo', valor: '0', icono: 'warning', color: '#e74c3c' }
  ];

  citasUrgentes: any[] = [];
  materialesBajos: any[] = [];

  // Datos de funciones resumen (SUM, AVG, DECODE)
  ingresosAnuales: number = 0;
  promedioPagoAnual: number = 0;
  clasificacionPagos: { alto: number; medio: number; bajo: number } = { alto: 0, medio: 0, bajo: 0 };
  ingresosAnualesStr: string = 'MX$0.00';
  promedioPagoAnualStr: string = 'MX$0.00';

  private parseNumber(val: any): number {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return Number(val) || 0;
  }

  // Configuración Gráfica de Barras (Ingresos)
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Ingresos ($)', backgroundColor: '#4a2e1f', hoverBackgroundColor: '#6d4c41' }]
  };
  
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  // Configuración Gráfica de Dona (Estados)
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Programada', 'Confirmada', 'En Progreso', 'Completada', 'Cancelada'],
    datasets: [{ 
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#90caf9', '#a5d6a7', '#ffb74d', '#2b1a10', '#ef9a9a'],
      borderColor: '#fdf5eb', 
      borderWidth: 2
    }]
  };
  
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#4a2e1f', font: { family: 'Inter' } } }
    }
  };

  constructor(
    private citasService: CitasService,
    private inventarioService: InventarioService,
    private pagosService: PagosService,
    private reportesService: ReportesService, // Servicio de reportes (citas detalladas)
    private funcionesResumenService: FuncionesResumenService, // Servicio exclusivo funciones_resumen
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    console.log('🔄 Cargando datos del dashboard...');
    
    // Ejecutamos todas las peticiones en paralelo
    forkJoin({
      citas: this.citasService.getCitas().pipe(
        catchError(err => { console.error('Error citas:', err); return of([]); })
      ), // Para KPIs numéricos y gráficas
      materiales: this.inventarioService.getMateriales().pipe(
        catchError(err => { console.error('Error materiales:', err); return of([]); })
      ),
      pagos: this.pagosService.getPagos().pipe(
        catchError(err => { console.error('Error pagos:', err); return of([]); })
      ),
      citasDetalladas: this.reportesService.getProximasCitas().pipe(
        catchError(err => { console.error('Error proximas citas:', err); return of([]); })
      ), // Datos con JOIN para la lista visual
      funcionesResumen: this.funcionesResumenService.getFuncionesResumen().pipe(
        catchError(err => {
          console.error('Error funciones_resumen:', err);
          return of({
            sum_ingresos_anuales: 0,
            avg_pago_anual: 0,
            decode_clasificacion: { alto: 0, medio: 0, bajo: 0 }
          });
        })
      ) // SUM, AVG y DECODE
    }).subscribe({
      next: (res) => {
        console.log('Dashboard combined data:', res);
        // Procesar datos para KPIs y Gráficas
        if (res.citas) this.procesarKPIsCitas(res.citas);
        if (res.materiales) this.procesarInventario(res.materiales);
        if (res.pagos) this.procesarFinanzas(res.pagos);
        
        // Asignar directamente la lista detallada que viene del backend (JOIN)
        if (res.citasDetalladas) {
          this.citasUrgentes = res.citasDetalladas;
        }

        // Procesar funciones resumen (SUM, AVG, DECODE)
        if (res.funcionesResumen) {
          let fr = res.funcionesResumen as any;
          // Si el backend regresa un arreglo, tomar el primer elemento
          if (Array.isArray(fr)) {
            fr = fr[0] ?? {};
          }
          console.log('Funciones resumen (raw):', fr);
          // Mapeo exacto según los logs: sum.totalIngresosAnuales y avg.promedioPagoAnual
          const sumVal = (fr?.sum?.totalIngresosAnuales)
            ?? fr.sum_ingresos_anuales ?? fr.sumIngresosAnuales ?? fr.sum ?? fr.ingresosAnuales ?? fr.total ?? (fr?.sum?.ingresos_anuales);
          const avgVal = (fr?.avg?.promedioPagoAnual)
            ?? fr.avg_pago_anual ?? fr.avgPagoAnual ?? fr.avg ?? fr.promedioPagoAnual ?? (fr?.avg?.pago_anual);
          const decodeVal = (fr?.decode?.clasificacionPagos)
            ?? fr.decode_clasificacion ?? fr.decodeClasificacion ?? fr.clasificacion ?? fr.pagosClasificacion ?? fr.decode;

          this.ingresosAnuales = this.parseNumber(sumVal);
          this.promedioPagoAnual = this.parseNumber(avgVal);
          this.ingresosAnualesStr = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(this.ingresosAnuales);
          this.promedioPagoAnualStr = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(this.promedioPagoAnual);

          // Procesar decode: puede venir como objeto {alto, medio, bajo} o como arreglo de {categoria, cantidad}
          let alto = 0, medio = 0, bajo = 0;
          const dec = decodeVal ?? { alto: 0, medio: 0, bajo: 0 };
          if (Array.isArray(dec)) {
            // Buscar por nombre de categoría (tolerante a mayúsculas/minúsculas)
            dec.forEach((item: any) => {
              const cat = (item.categoria ?? item.tipo ?? item.nombre ?? '').toString().toLowerCase();
              const cantidad = this.parseNumber(item.cantidad ?? item.total ?? item.valor);
              if (cat.includes('alto')) alto = cantidad;
              else if (cat.includes('medio')) medio = cantidad;
              else if (cat.includes('bajo')) bajo = cantidad;
            });
          } else {
            alto = this.parseNumber(dec.alto ?? dec.Alto ?? 0);
            medio = this.parseNumber(dec.medio ?? dec.Medio ?? 0);
            bajo = this.parseNumber(dec.bajo ?? dec.Bajo ?? 0);
          }
          this.clasificacionPagos = { alto, medio, bajo };
        } else {
          console.warn('Funciones resumen no disponible en la respuesta.');
        }

        // Forzar actualización visual de las gráficas
        this.charts?.forEach(c => c.update());
        
        // Evitar error NG0100 (ExpressionChangedAfterItHasBeenChecked)
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('❌ Error cargando dashboard:', err)
    });
  }

  procesarKPIsCitas(citas: any[]) {
    const hoy = new Date();
    const hoyStr = hoy.toDateString();

    // 1. KPI: Citas Hoy
    const citasHoy = citas.filter(c => {
      const fechaCita = new Date(c.fecha_programada); 
      return fechaCita.toDateString() === hoyStr;
    });
    this.kpis[0].valor = citasHoy.length.toString();

    // 2. Gráfica Dona: Conteo de Estados
    let countProgramada = 0, countConfirmada = 0, countProgreso = 0, countCompletada = 0, countCancelada = 0;

    citas.forEach(c => {
      const estado = c.estado ? c.estado.toLowerCase().trim() : '';
      if (estado === 'programada') countProgramada++;
      else if (estado === 'confirmada') countConfirmada++;
      else if (estado.includes('progreso')) countProgreso++; // "en_progreso" o "en progreso"
      else if (estado === 'completada') countCompletada++;
      else if (estado === 'cancelada') countCancelada++;
    });

    this.doughnutChartData.datasets[0].data = [
      countProgramada, countConfirmada, countProgreso, countCompletada, countCancelada
    ];
  }

  procesarInventario(materiales: any[]) {
    // KPI y Lista: Material Bajo
    const bajos = materiales.filter(m => {
      const stock = Number(m.cantidad_existencia);
      const minimo = Number(m.nivel_reorden);
      return stock <= minimo;
    });
    
    this.kpis[2].valor = bajos.length.toString();
    this.materialesBajos = bajos.slice(0, 3); // Solo mostrar 3 alertas
  }

  procesarFinanzas(pagos: any[]) {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anoActual = hoy.getFullYear();

    // KPI: Ingresos del Mes Actual
    const ingresosMes = pagos
      .filter(p => {
        const fechaPago = new Date(p.fecha_pago); 
        return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anoActual;
      })
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

    this.kpis[1].valor = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(ingresosMes);

    // Gráfica Barras: Últimos 6 meses
    const etiquetas = [];
    const datos = [];
    
    for (let i = 5; i >= 0; i--) {
      const fechaRef = new Date(anoActual, mesActual - i, 1);
      const mesNombre = fechaRef.toLocaleString('es-MX', { month: 'short' });
      etiquetas.push(mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1));

      const totalMes = pagos
        .filter(p => {
          const fp = new Date(p.fecha_pago);
          return fp.getMonth() === fechaRef.getMonth() && fp.getFullYear() === fechaRef.getFullYear();
        })
        .reduce((acc, curr) => acc + Number(curr.monto), 0);
      
      datos.push(totalMes);
    }

    this.barChartData.labels = etiquetas;
    this.barChartData.datasets[0].data = datos;
  }
}