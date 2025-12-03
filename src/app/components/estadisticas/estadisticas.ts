import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Servicios
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service';
import { PagosService } from '../../services/pagos-service';
import { ComprasService } from '../../services/compras-service';
import { ReportesService } from '../../services/reportes-service';
import { FuncionesResumenService } from '../../services/funciones-resumen-service';

// Material & Charts
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CategoriasDisenosCursorService, CategoriaDisenosDTO } from '../../services/categorias-disenos-cursor-service';
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
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    BaseChartDirective
  ],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas implements OnInit {
    // Data para la tabla de Categorías y Total de Diseños
    categoriasColumns: string[] = ['categoria', 'totalDisenos'];
    categoriasDS = new MatTableDataSource<{ categoria: string; totalDisenos: number }>([]);
    categoriasTotal = 0;
  
    // Paginación y orden
    @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sorts!: QueryList<MatSort>;
  
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

  // KPIs Superiores (Tarjetas pequeñas)
  kpis = [
    { titulo: 'Citas Hoy', valor: '0', icono: 'today', color: '#3f51b5' },
    { titulo: 'Ingresos Mes Actual', valor: '$0', icono: 'attach_money', color: 'green' },
    { titulo: 'Material Bajo', valor: '0', icono: 'warning', color: '#e74c3c' }
  ];

  // Listas para "Actividad y Alertas"
  citasUrgentes: any[] = [];
  materialesBajos: any[] = [];

  // VARIABLE ÚNICA PARA LA SECCIÓN DE RESUMEN
  totalPagos3MesesStr: string = 'MX$0.00';
  totalCompras3MesesStr: string = 'MX$0.00';
  totalCombinado3MesesStr: string = 'MX$0.00';

  // Configuración Gráficas (Se mantiene igual)
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Ingresos ($)', backgroundColor: '#4a2e1f', hoverBackgroundColor: '#6d4c41' }]
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' } } }
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Programada', 'Confirmada', 'En Progreso', 'Completada', 'Cancelada'],
    datasets: [{ 
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#90caf9', '#a5d6a7', '#ffb74d', '#2b1a10', '#ef9a9a'],
      borderColor: '#fdf5eb', borderWidth: 2
    }]
  };
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#4a2e1f', font: { family: 'Inter' } } } }
  };

  constructor(
    private citasService: CitasService,
    private inventarioService: InventarioService,
    private pagosService: PagosService,
    private comprasService: ComprasService,
    private reportesService: ReportesService,
    private funcionesResumenService: FuncionesResumenService,
    private categoriasDisenosService: CategoriasDisenosCursorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    forkJoin({
      citas: this.citasService.getCitas().pipe(catchError(() => of([]))),
      materiales: this.inventarioService.getMateriales().pipe(catchError(() => of([]))),
      pagos: this.pagosService.getPagos().pipe(catchError(() => of([]))),
      compras: this.comprasService.getOrdenes().pipe(catchError(() => of([]))),
      citasDetalladas: this.reportesService.getProximasCitas().pipe(catchError(() => of([]))),
      
      // Llamada al nuevo endpoint simplificado
      funcionesResumen: this.funcionesResumenService.getFuncionesResumen().pipe(
        catchError(err => {
          console.error('Error funciones_resumen:', err);
          return of({ promedio_ingresos_mensual: 0 });
        })
      ),
      categoriasDisenos: this.categoriasDisenosService.listar().pipe(catchError(() => of([])))
    }).subscribe({
      next: (res) => {
        if (res.citas) this.procesarKPIsCitas(res.citas);
        if (res.materiales) this.procesarInventario(res.materiales);
        if (res.pagos) this.procesarFinanzas(res.pagos);
        if (res.pagos && res.compras) this.procesarComparacion3Meses(res.pagos, res.compras);
        if (res.citasDetalladas) this.citasUrgentes = res.citasDetalladas;

        // Tabla Categorías y Diseños
        if (res.categoriasDisenos) {
          const mapped = (res.categoriasDisenos as CategoriaDisenosDTO[]).map(r => ({
            categoria: (r.categoria ?? '').toString().replace(/[_-]/g, ' '),
            totalDisenos: Number(r.totalDisenos ?? 0)
          }));
          // Orden descendente por totalDisenos
          mapped.sort((a, b) => b.totalDisenos - a.totalDisenos);
          this.categoriasDS = new MatTableDataSource(mapped);
          this.categoriasTotal = mapped.reduce((acc, curr) => acc + curr.totalDisenos, 0);
        }

        this.charts?.forEach(c => c.update());
        this.cdr.detectChanges(); 
      }
    });
  }

  // ... (procesarKPIsCitas, procesarInventario, procesarFinanzas se mantienen igual) ...
  
  procesarKPIsCitas(citas: any[]) {
    const hoyStr = new Date().toDateString();
    const citasHoy = citas.filter(c => new Date(c.fecha_programada).toDateString() === hoyStr);
    this.kpis[0].valor = citasHoy.length.toString();

    let conteo = { programada: 0, confirmada: 0, progreso: 0, completada: 0, cancelada: 0 };
    citas.forEach(c => {
      const est = c.estado ? c.estado.toLowerCase().trim() : '';
      if (est === 'programada') conteo.programada++;
      else if (est === 'confirmada') conteo.confirmada++;
      else if (est.includes('progreso')) conteo.progreso++;
      else if (est === 'completada') conteo.completada++;
      else if (est === 'cancelada') conteo.cancelada++;
    });
    this.doughnutChartData.datasets[0].data = Object.values(conteo);
  }

  procesarInventario(materiales: any[]) {
    const bajos = materiales.filter(m => Number(m.cantidad_existencia) <= Number(m.nivel_reorden));
    this.kpis[2].valor = bajos.length.toString();
    this.materialesBajos = bajos.slice(0, 3);
  }

  procesarFinanzas(pagos: any[]) {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anoActual = hoy.getFullYear();

    const ingresosMes = pagos
      .filter(p => {
        const fp = new Date(p.fecha_pago); 
        return fp.getMonth() === mesActual && fp.getFullYear() === anoActual;
      })
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

    this.kpis[1].valor = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(ingresosMes);

    // Gráfica Barras
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

  procesarComparacion3Meses(pagos: any[], compras: any[]) {
    const hoy = new Date();
    const hace3Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 3, hoy.getDate());

    const totalPagos = pagos
      .filter(p => new Date(p.fecha_pago) >= hace3Meses)
      .reduce((acc, curr) => acc + Number(curr.monto), 0);

    const totalCompras = compras
      .filter(c => new Date(c.fecha_compra || c.fecha) >= hace3Meses)
      .reduce((acc, curr) => acc + Number(curr.total || curr.monto), 0);

    const totalCombinado = totalPagos - totalCompras;

    const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
    
    this.totalPagos3MesesStr = formatCurrency(totalPagos);
    this.totalCompras3MesesStr = formatCurrency(totalCompras);
    this.totalCombinado3MesesStr = formatCurrency(totalCombinado);
  }
}