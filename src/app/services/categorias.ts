import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Categorias {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Obtener catálogo real de categorías
  getCategorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categorias`);
  }
}
