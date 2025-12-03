import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  // Base URL: http://localhost:3000/api/inventario
  private apiUrl = 'http://localhost:3000/api/inventario';

  constructor(private http: HttpClient) { }

  // 1. Obtener lista de todos los materiales
  getMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/materiales`);
  }

  // 2. NUEVO MÉTODO: Obtener reporte de Inventario Bajo
  getInventarioBajo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/inventario-bajo`);
  }

  // 3. Crear nuevo material
  crearMaterial(material: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/materiales`, material);
  }

  // 4. Editar material existente
  editarMaterial(id: number, material: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/materiales/${id}`, material);
  }

  // 5. Eliminar material
  eliminarMaterial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/materiales/${id}`);
  }

  // 6. Buscar un material por ID
  getMaterialById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/materiales/${id}`);
  }

  // 7. NUEVO: Reporte agrupado por proveedor (GROUP BY / HAVING)
  getReportePorProveedor(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reporte-proveedores`);
  }
}