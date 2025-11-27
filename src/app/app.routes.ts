import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Dashboard } from './components/dashboard/dashboard';
import { Estadisticas } from './components/estadisticas/estadisticas';
import { Inventario } from './components/inventario/inventario';
import { Clientes } from './components/clientes/clientes';
import { MainLayout } from './layout/main-layout/main-layout';
import { Citas } from './components/citas/citas';
import { Artistas } from './components/artistas/artistas';
import { Estilos } from './components/estilos/estilos';
import { Galeria } from './components/galeria/galeria';
import { Contacto } from './components/contacto/contacto';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Home },
      { path: 'artistas', component: Artistas },
      { path: 'estilos', component: Estilos },
      { path: 'galeria', component: Galeria },
      { path: 'contacto', component: Contacto }
    ]
  },

  {
    path: 'dashboard',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      
      { path: 'resumen', component: Estadisticas },
      { path: 'citas', component: Citas },
      { path: 'inventario', component: Inventario },
      { path: 'clientes', component: Clientes }
      
    ]
  },

  { path: '**', redirectTo: '' }
];