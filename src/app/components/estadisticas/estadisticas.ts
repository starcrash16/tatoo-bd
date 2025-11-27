import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-estadisticas',
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
export class Estadisticas {
  kpis = [
    { titulo: 'Citas Hoy', valor: 5, icono: 'today', color: '#3f51b5' },
    { titulo: 'Ingresos Mes', valor: '$12,450', icono: 'attach_money', color: 'green' },
    { titulo: 'Material Bajo', valor: 3, icono: 'warning', color: '#e74c3c' }
  ];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      { 
        data: [6500, 5900, 8000, 8100, 5600, 9000], 
        label: 'Ingresos ($)',
        backgroundColor: '#4a2e1f',
        hoverBackgroundColor: '#6d4c41'
      }
    ]
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6d4c41' }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#6d4c41' }
      }
    }
  };

  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Pendiente', 'Confirmada', 'Finalizada', 'Cancelada'],
    datasets: [ { 
      data: [10, 20, 45, 5],
      backgroundColor: ['#ffd740', '#69f0ae', '#448aff', '#ff5252'],
      borderColor: '#fdf5eb',
      borderWidth: 2
    } ]
  };
  
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#4a2e1f', font: { family: 'Inter' } }
      }
    }
  };
}
