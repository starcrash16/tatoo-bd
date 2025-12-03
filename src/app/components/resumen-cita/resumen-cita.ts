import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CitasService } from '../../services/citas-service';
import { InventarioService } from '../../services/inventario-service';

interface Diseno {
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  complejidad: number;
  precio_base: string;
  creado_por: string;
  creado_en: string;
  nombre_categoria: string;
}

// Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-resumen-cita',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './resumen-cita.html',
  styleUrl: './resumen-cita.css'
})
export class ResumenCita implements OnInit {
  
  cita: any | null = null;
  citaId: string | null = null;
  cargando: boolean = true;

  // Catálogos
  clientes: any[] = [];
  artistas: any[] = [];
  listaMateriales: any[] = [];
  mapaDisenos: { [key: string]: Diseno[] } = {};
  categorias: string[] = [];
  materialesUsados: any[] = [];

  // Datos calculados para la vista
  clienteInfo: any = null;
  artistaInfo: any = null;
  disenoInfo: Diseno | null = null;
  categoriaSeleccionada: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citasService: CitasService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.citaId = params.get('id');
      if (this.citaId) {
        this.cargarResumenCita(this.citaId);
      }
    });
  }

  cargarResumenCita(id: string) {
    console.log('🔍 Cargando datos de cita ID:', id);
    this.cargando = true;
    
    // Cargar la cita principal
    this.citasService.getCitaById(+id).subscribe({
      next: (cita) => {
        console.log('✅ Cita recibida:', cita);
        this.cita = cita;
        
        // Cargar catálogos para resolver referencias
        this.cargarCatalogos();
      },
      error: (err) => {
        console.error('❌ Error cargando cita:', err);
        this.cargando = false;
        this.cita = null;
      }
    });
  }

  cargarCatalogos() {
    console.log('📚 Cargando catálogos...');
    
    // Cargar clientes
    this.citasService.getClientes().subscribe(data => {
      this.clientes = data;
      this.resolverCliente();
    });

    // Cargar artistas
    this.citasService.getArtistas().subscribe(data => {
      this.artistas = data;
      this.resolverArtista();
    });

    // Cargar materiales
    this.inventarioService.getMateriales().subscribe(data => {
      this.listaMateriales = data;
      this.resolverMateriales();
    });

    // Cargar diseños con categoría
    this.citasService.getDisenosConCategoria().subscribe((data: Diseno[]) => {
      console.log('✅ Diseños recibidos:', data);
      this.construirMapa(data);
      this.resolverDiseno();
      this.cargando = false;
    });
  }

  construirMapa(disenos: Diseno[]) {
    this.mapaDisenos = {};
    const categoriasSet = new Set<string>();

    disenos.forEach(diseno => {
      const categoria = diseno.nombre_categoria;
      if (!categoria || categoria.trim() === '') return;

      categoriasSet.add(categoria);
      if (!this.mapaDisenos[categoria]) {
        this.mapaDisenos[categoria] = [];
      }
      this.mapaDisenos[categoria].push(diseno);
    });

    this.categorias = Array.from(categoriasSet).sort();
    console.log('🗺️ Mapa de diseños construido:', this.mapaDisenos);
  }

  resolverCliente() {
    if (this.cita && this.clientes.length > 0) {
      this.clienteInfo = this.clientes.find(c => c.id === this.cita.id_cliente);
      console.log('👤 Cliente resuelto:', this.clienteInfo);
    }
  }

  resolverArtista() {
    if (this.cita && this.artistas.length > 0) {
      this.artistaInfo = this.artistas.find(a => a.id === this.cita.id_artista);
      console.log('🎨 Artista resuelto:', this.artistaInfo);
    }
  }

  resolverDiseno() {
    if (!this.cita) return;

    // Si la cita tiene datos de diseño (estado confirmada o completada)
    const idDiseno = this.cita.id_diseno;
    if (idDiseno) {
      // Buscar en todos los diseños del mapa
      for (const categoria in this.mapaDisenos) {
        const diseno = this.mapaDisenos[categoria].find(d => d.id === idDiseno.toString());
        if (diseno) {
          this.disenoInfo = diseno;
          this.categoriaSeleccionada = categoria;
          console.log('🎨 Diseño resuelto:', this.disenoInfo);
          break;
        }
      }
    }
  }

  resolverMateriales() {
    // Si la cita tiene materiales asociados (para estado en_progreso o completada)
    if (this.cita && this.cita.materiales && this.listaMateriales.length > 0) {
      this.materialesUsados = this.cita.materiales.map((m: any) => {
        const material = this.listaMateriales.find(mat => mat.id === m.id);
        return {
          ...material,
          cantidad: m.cantidad
        };
      });
      console.log('🧪 Materiales resueltos:', this.materialesUsados);
    }
  }

  volver() {
    this.router.navigate(['/dashboard/citas']);
  }
}
