import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CubeRowDTO {
  categoria: string;
  artista: string;
  totalCitas: number;
  totalMonto: number;
  tipoFila?: 'detalle' | 'total_categoria' | 'total_artista' | 'total_general' | string;
}

@Injectable({ providedIn: 'root' })
export class CategoriasArtistasCubeService {
  private readonly baseUrl = 'http://localhost:3000/api/categorias_artistas_cube';

  constructor(private http: HttpClient) {}

  listar(): Observable<CubeRowDTO[]> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(resp => Array.isArray(resp) ? resp : (resp?.data ?? []))
    );
  }
}
