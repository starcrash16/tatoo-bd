import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComprasService {

  // Ajusta el puerto si tu backend corre en otro (ej. 3001)
  private baseUrl = 'http://localhost:3000/api'; 

  constructor(private http: HttpClient) { }

  getProveedores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/proveedores`);
  }

  getMateriales(): Observable<any[]> {
    // Esta ruta debe devolver ID, NOMBRE, CODIGO, STOCK
    return this.http.get<any[]>(`${this.baseUrl}/inventario/materiales`);
  }

  registrarCompra(data: any): Observable<any> {
    // Apunta al archivo routes/compras.js -> router.post('/registrar')
    return this.http.post(`${this.baseUrl}/compras/registrar`, data);
  }
  
  // Para la lista principal
  getOrdenes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compras`);
  }
}