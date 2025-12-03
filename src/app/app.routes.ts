import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Estadisticas } from './components/estadisticas/estadisticas';
import { Inventario } from './components/inventario/inventario';
import { NuevoProducto } from './components/nuevo-producto/nuevo-producto';
import { Clientes } from './components/clientes/clientes';
import { NuevoCliente } from './components/nuevo-cliente/nuevo-cliente';
import { ExpedienteMedico } from './components/expediente-medico/expediente-medico';
import { MainLayout } from './layout/main-layout/main-layout';
import { Citas } from './components/citas/citas';
import { NuevaCita } from './components/nueva-cita/nueva-cita';
import { ResumenCita } from './components/resumen-cita/resumen-cita';
import { Artistas } from './components/artistas/artistas';
import { Estilos } from './components/estilos/estilos';
import { Galeria } from './components/galeria/galeria';
import { Contacto } from './components/contacto/contacto';
import { Reportes } from './components/reportes/reportes';
import { SesionesComponent } from './components/sesiones/sesiones';
import { ArtistasDashboard } from './components/artistas-dashboard/artistas-dashboard';
import { Compras } from './components/compras/compras';
import { NuevaCompra } from './components/nueva-compra/nueva-compra';
import { PagosComponent } from './components/pagos/pagos';


export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'artistas', component: Artistas },
      { path: 'estilos', component: Estilos },
      { path: 'galeria', component: Galeria },
      { path: 'contacto', component: Contacto },
      { path: 'login', component: Login }
    ]
  },

  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'resumen', component: Estadisticas },
      { path: 'citas', component: Citas },
      { path: 'citas/nueva', component: NuevaCita },
      { path: 'citas/editar/:id', component: NuevaCita },
      { path: 'citas/resumen/:id', component: ResumenCita },
      { path: 'inventario', component: Inventario },
      { path: 'inventario/nuevo', component: NuevoProducto },
      { path: 'inventario/editar/:id', component: NuevoProducto },
      { path: 'clientes', component: Clientes },
      { path: 'clientes/nuevo', component: NuevoCliente},
      { path: 'clientes/editar/:id', component: NuevoCliente},
      { path: 'clientes/expediente/:id', component: ExpedienteMedico},
      { path: 'sesiones', component: SesionesComponent },
      { path: 'reportes', component: Reportes },
      { path: 'pagos', component: PagosComponent },
      { path: 'artistas', component: ArtistasDashboard },
      { path: 'compras', component: Compras },
      { path: 'compras/nueva', component: NuevaCompra }
    ]
  },

  { path: '**', redirectTo: '' }
];