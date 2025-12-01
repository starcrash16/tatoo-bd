import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
}