import { Component, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaMatcher } from '@angular/cdk/layout';
import { RouterModule, Router } from '@angular/router';

// Angular Material Imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth-service'; // Importamos AuthService

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  
  // Variables para la vista
  nombreUsuario: string = 'Admin'; // Valor por defecto
  iniciales: string = 'GT';        // Valor por defecto
  rolUsuario: string = '';

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef, 
    media: MediaMatcher,
    private router: Router,
    private authService: AuthService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    // Recuperamos el string guardado en el Login
    const usuarioGuardado = localStorage.getItem('usuario_sesion');

    if (usuarioGuardado) {
      const usuario = JSON.parse(usuarioGuardado);
      
      // 1. Asignar Nombre (Preferimos 'Nombre' real, si no, el 'username')
      this.nombreUsuario = usuario.nombre || usuario.nombre_usuario || 'Admin';

      // 2. Calcular Iniciales (Ej: Juan Perez -> JP)
      const letraNombre = usuario.nombre ? usuario.nombre.charAt(0) : (usuario.nombre_usuario.charAt(0) || 'G');
      const letraApellido = usuario.apellido ? usuario.apellido.charAt(0) : 'T';
      
      this.iniciales = (letraNombre + letraApellido).toUpperCase();
    }
  }

  cerrarSesion() {
    this.authService.logout(); // Limpia localStorage
    this.router.navigate(['/login']); // Redirige al login
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}