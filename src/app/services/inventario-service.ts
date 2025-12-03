import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; // <--- Se agregó HttpParams
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  // CAMBIO: Apuntamos a la base 'api' para poder navegar entre distintas rutas (inventario, materiales_sesion, reportes)
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // --- MATERIALES (CRUD) ---

  // 1. Obtener lista de todos los materiales
  // Ruta: /api/inventario/materiales
  getMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventario/materiales`);
  }

  // 2. Obtener reporte de Inventario Bajo
  // Ruta: /api/inventario/inventario-bajo (Según tu configuración previa)
  getInventarioBajo(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/inventario/inventario-bajo`);
  }

  // 3. Crear nuevo material
  crearMaterial(material: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventario/materiales`, material);
  }

  // 4. Editar material existente
  editarMaterial(id: number, material: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventario/materiales/${id}`, material);
  }

  // 5. Eliminar material
  eliminarMaterial(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventario/materiales/${id}`);
  }

  // 6. Buscar un material por ID
  getMaterialById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/inventario/materiales/${id}`);
  }

  // --- OTROS REPORTES ---

  // 7. Reporte agrupado por proveedor
  getReportePorProveedor(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/inventario/reporte-proveedores`);
  }

  // --- MATERIALES SESIÓN ---

  // 8. Obtener materiales por sesión (con filtros)
  // Ruta: /api/materiales_sesion (Esta ruta suele estar separada de /inventario)
  getMaterialesSesion(filtros: any): Observable<any[]> {
    let params = new HttpParams();
    
    if (filtros.id_sesion) {
      params = params.set('id_sesion', filtros.id_sesion);
    }
    
    if (filtros.id_material) {
      params = params.set('id_material', filtros.id_material);
    }

    return this.http.get<any[]>(`${this.baseUrl}/materiales_sesion`, { params });
  }
}