import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:3000/api/reportes';

  constructor(private http: HttpClient) { }

  // Obtiene los datos ya unidos desde el backend
  getDetalleCitaCompleto(idCita: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cita/${idCita}`);
  }
}