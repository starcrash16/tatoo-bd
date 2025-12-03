import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';
import { ArtistasCitasSecuenciaService, ArtistaCitaSecuenciaDTO } from '../../services/artistas-citas-secuencia-service';
import { CategoriasArtistasCubeService, CubeRowDTO } from '../../services/categorias-artistas-cube-service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

interface RegistroArtistaCita {
  consecutivo: number; // generado por backend
  artista: string;
  citaId: string | number;
  fechaProgramada: string; // ISO o legible
  estado: 'programada' | 'completada' | 'cancelada' | 'reprogramada' | 'confirmada' | 'no_asistio';
}

interface CubeRow {
  categoria: string;
  artista: string;
  totalCitas: number;
  totalMonto: number;
  tipoFila: 'detalle' | 'total_categoria' | 'total_artista' | 'total_general' | string;
}

@Component({
  selector: 'app-artistas-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule, HttpClientModule, MatSortModule, MatPaginatorModule],
  templateUrl: './artistas-dashboard.html',
  styleUrl: './artistas-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistasDashboard implements OnInit {
  displayedColumns: string[] = ['consecutivo', 'artista', 'citaId', 'fechaProgramada', 'estado'];
  displayedCubeColumns: string[] = ['categoria', 'artista', 'totalCitas', 'totalMonto', 'tipoFila'];

  dataSource = new MatTableDataSource<RegistroArtistaCita>([]);
  dataSourceCube = new MatTableDataSource<CubeRow>([]);

  @ViewChild('mainSort', { static: true }) sort!: MatSort;
  @ViewChild('mainPaginator', { static: true }) paginator!: MatPaginator;
  @ViewChild('cubeSort', { static: true }) cubeSort!: MatSort;
  @ViewChild('cubePaginator', { static: true }) cubePaginator!: MatPaginator;

  constructor(
    private svc: ArtistasCitasSecuenciaService,
    private cubeSvc: CategoriasArtistasCubeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.svc.listar().subscribe({
      next: (rows: ArtistaCitaSecuenciaDTO[]) => {
        // Adaptar DTO a la interfaz interna si es igual, se asigna directo
        const mapped = rows.map(r => ({
          consecutivo: r.consecutivo,
          artista: r.nombreArtista,
          citaId: r.idCita,
          fechaProgramada: r.fechaProgramada,
          estado: (r.estado || '').toLowerCase() as any
        }));
        // Deferir la asignación para evitar NG0100
        Promise.resolve().then(() => {
          this.dataSource = new MatTableDataSource<RegistroArtistaCita>(mapped);
          // ordenar por consecutivo descendente por defecto
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.sort.active = 'consecutivo';
          this.sort.direction = 'desc';
          this.dataSource.sortData = (data, sort) => {
            const isAsc = sort.direction === 'asc';
            const key = sort.active as keyof RegistroArtistaCita;
            return data.slice().sort((a, b) => {
              const va = a[key];
              const vb = b[key];
              const na = typeof va === 'string' ? va.toString() : (va as any);
              const nb = typeof vb === 'string' ? vb.toString() : (vb as any);
              return (na < nb ? -1 : na > nb ? 1 : 0) * (isAsc ? 1 : -1);
            });
          };
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Error cargando artistas_citas_secuencias', err);
      }
    });
    
    this.cubeSvc.listar().subscribe({
      next: (rows: CubeRowDTO[]) => {
        const mapped: CubeRow[] = rows.map(r => ({
          categoria: r.categoria,
          artista: r.artista,
          totalCitas: Number(r.totalCitas ?? 0),
          totalMonto: Number(r.totalMonto ?? 0),
          tipoFila: (r.tipoFila as any) || 'detalle'
        }));
        Promise.resolve().then(() => {
          this.dataSourceCube = new MatTableDataSource<CubeRow>(mapped);
          this.dataSourceCube.sort = this.cubeSort;
          this.dataSourceCube.paginator = this.cubePaginator;
          this.cubeSort.active = 'totalMonto';
          this.cubeSort.direction = 'desc';
          this.cdr.markForCheck();
        });
      },
      error: (err) => {
        console.error('Error cargando categorias_artistas_cube', err);
      }
    });
  }
}
