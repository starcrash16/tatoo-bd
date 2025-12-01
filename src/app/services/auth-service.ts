import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta la URL si tu backend está en otro lado
  private apiUrl = 'http://localhost:3000/api/usuarios';

  constructor(private http: HttpClient) { }

  login(identificador: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { identificador, contrasena }).pipe(
      tap((response: any) => {
        console.log('Login exitoso:', response);
        
        // --- CAMBIO IMPORTANTE ---
        // Guardamos el objeto usuario en el navegador para usarlo en el Dashboard
        if (response.usuario) {
          localStorage.setItem('usuario_sesion', JSON.stringify(response.usuario));
        }
      })
    );
  }

  // Método para cerrar sesión (borra los datos)
  logout() {
    localStorage.removeItem('usuario_sesion');
  }
}