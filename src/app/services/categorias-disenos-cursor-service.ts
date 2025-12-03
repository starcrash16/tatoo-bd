import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CategoriaDisenosDTO {
  categoria: string;
  totalDisenos: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriasDisenosCursorService {
  private readonly baseUrl = 'http://localhost:3000/api/reportes/categorias_disenos_cursor';

  constructor(private http: HttpClient) {}

  listar(): Observable<CategoriaDisenosDTO[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(resp => {
        if (Array.isArray(resp)) return resp as CategoriaDisenosDTO[];
        if (resp?.categorias && Array.isArray(resp.categorias)) return resp.categorias as CategoriaDisenosDTO[];
        if (resp?.data && Array.isArray(resp.data)) return resp.data as CategoriaDisenosDTO[];
        return [];
      })
    );
  }
}
