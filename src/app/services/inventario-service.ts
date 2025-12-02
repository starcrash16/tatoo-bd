import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private apiUrl = 'http://localhost:3000/api/inventario';

  constructor(private http: HttpClient) { }

  // Obtener lista de materiales (Usa tu ruta existente GET /materiales)
  getMateriales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/materiales`);
  }

  // Crear nuevo material (Necesitarás agregar el POST en tu backend)
  crearMaterial(material: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/materiales`, material);
  }

  // Editar material existente (Necesitarás agregar el PUT en tu backend)
  editarMaterial(id: number, material: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/materiales/${id}`, material);
  }

  // Eliminar material (Necesitarás agregar el DELETE en tu backend)
  eliminarMaterial(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/materiales/${id}`);
  }

  //Buscar un material por ID
  getMaterialById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/materiales/${id}`);
  }
}