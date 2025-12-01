import { Component, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core'; // 1. IMPORTAR ViewChildren y QueryList
import { CommonModule } from '@angular/common';
// Servicios
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service';
import { PagosService } from '../../services/pagos-service';

// Material & Charts
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';

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
  
  // 2. CAMBIO CRÍTICO: Usamos ViewChildren para obtener TODAS las gráficas, no solo la primera
  @ViewChildren(BaseChartDirective) charts: QueryList<BaseChartDirective> | undefined;

  kpis = [
    { titulo: 'Citas Hoy', valor: '0', icono: 'today', color: '#3f51b5' },
    { titulo: 'Ingresos Mes', valor: '$0', icono: 'attach_money', color: 'green' },
    { titulo: 'Material Bajo', valor: '0', icono: 'warning', color: '#e74c3c' }
  ];

  citasUrgentes: any[] = [];
  materialesBajos: any[] = [];

  // GRÁFICA BARRAS
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

  // GRÁFICA DONA
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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargarDatosDashboard();
  }

  cargarDatosDashboard() {
    console.log('🔄 Cargando datos del dashboard...');
    
    forkJoin({
      citas: this.citasService.getCitas(),
      materiales: this.inventarioService.getMateriales(),
      pagos: this.pagosService.getPagos()
    }).subscribe({
      next: (res) => {
        console.log('✅ Datos recibidos:', res);
        
        if (res.citas) this.procesarCitas(res.citas);
        if (res.materiales) this.procesarInventario(res.materiales);
        if (res.pagos) this.procesarFinanzas(res.pagos);

        // 3. ACTUALIZAR TODAS LAS GRÁFICAS
        // Iteramos sobre la lista de gráficas encontradas en el HTML y las actualizamos una por una
        this.charts?.forEach(chart => {
          chart.update();
        });
        
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error('❌ Error cargando dashboard:', err)
    });
  }

  procesarCitas(citas: any[]) {
    const hoy = new Date();
    const hoyStr = hoy.toDateString();

    // KPI: Citas Hoy
    const citasHoy = citas.filter(c => {
      const fechaCita = new Date(c.fecha_programada); 
      return fechaCita.toDateString() === hoyStr;
    });
    this.kpis[0].valor = citasHoy.length.toString();

    // Gráfica Dona
    let countProgramada = 0, countConfirmada = 0, countProgreso = 0, countCompletada = 0, countCancelada = 0;

    citas.forEach(c => {
      const estado = c.estado ? c.estado.toLowerCase().trim() : '';
      if (estado === 'programada') countProgramada++;
      else if (estado === 'confirmada') countConfirmada++;
      else if (estado === 'en_progreso' || estado === 'en progreso') countProgreso++;
      else if (estado === 'completada') countCompletada++;
      else if (estado === 'cancelada') countCancelada++;
    });

    this.doughnutChartData.datasets[0].data = [
      countProgramada, countConfirmada, countProgreso, countCompletada, countCancelada
    ];

    // Próximas Citas
    this.citasUrgentes = citas
      .filter(c => {
        const fecha = new Date(c.fecha_programada);
        const ahora = new Date();
        ahora.setHours(0,0,0,0);
        return fecha >= ahora && c.estado !== 'completada' && c.estado !== 'cancelada';
      })
      .sort((a, b) => new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime())
      .slice(0, 3);
  }

  procesarInventario(materiales: any[]) {
    // KPI y Lista: Material Bajo
    const bajos = materiales.filter(m => {
      const stock = Number(m.cantidad_existencia);
      const minimo = Number(m.nivel_reorden);
      return stock <= minimo;
    });
    
    this.kpis[2].valor = bajos.length.toString();
    this.materialesBajos = bajos.slice(0, 3);
  }

  procesarFinanzas(pagos: any[]) {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anoActual = hoy.getFullYear();

    // KPI: Ingresos del Mes
    const ingresosMes = pagos
      .filter(p => {
        const fechaPago = new Date(p.fecha_pago); 
        return fechaPago.getMonth() === mesActual && fechaPago.getFullYear() === anoActual;
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
}