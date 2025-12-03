import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // --- CITAS ---
  getCitas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/citas`);
  }

  getCitaById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/citas/${id}`);
  }

  getResumenCita(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/citas/resumen/${id}`);
  }

  generarCita(cita: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas/generar`, cita);
  }

  eliminarCita(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/citas/${id}`);
  }

  editarCita(id: number, cita: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/citas/${id}`, cita);
  }

  // --- CATALOGOS (Para llenar los select del formulario) ---
  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clientes`);
  }

  getArtistas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/artistas`);
  }

  getDisenos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/disenos`);
  }

  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }

  // Nueva API que retorna diseños con nombre_categoria incluido
  getDisenosConCategoria(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/disenos`);
  }

  // En CitasService (o SesionesService si lo creaste aparte)

// Método para buscar sesiones con filtros
buscarSesiones(filtros: any): Observable<any[]> {
  // Construimos los query params dinámicamente
  let params = new HttpParams();
  if (filtros.id_cita) params = params.set('id_cita', filtros.id_cita);
  if (filtros.estado) params = params.set('estado', filtros.estado);
  if (filtros.id_artista) params = params.set('id_artista', filtros.id_artista);
  if (filtros.id_cliente) params = params.set('id_cliente', filtros.id_cliente);

  return this.http.get<any[]>(`${this.apiUrl}/sesiones/busqueda`, { params });
}
}