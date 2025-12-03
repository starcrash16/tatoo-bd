import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface ArtistaCitaSecuenciaDTO {
  consecutivo: number;
  idArtista: number;
  nombreArtista: string;
  idCita: number | string;
  fechaProgramada: string; // ISO/string desde backend
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ArtistasCitasSecuenciaService {
  private readonly baseUrl = 'http://localhost:3000/api/artistas_citas_secuencia';

  constructor(private http: HttpClient) {}

  listar(): Observable<ArtistaCitaSecuenciaDTO[]> {
    return this.http.get<{ message?: string; data: ArtistaCitaSecuenciaDTO[] }>(this.baseUrl)
      .pipe(map(resp => resp.data));
  }
}
