import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = 'http://localhost:3000/api/reportes';

  constructor(private http: HttpClient) { }

  // 1. Obtener detalles completos de una cita para el PDF (JOIN 4 tablas)
  getDetalleCitaCompleto(idCita: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cita/${idCita}`);
  }

  // 2. Obtener lista de próximas citas urgentes para el Dashboard (JOIN 3 tablas)
  getProximasCitas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/proximas`);
  }

  // 3. Reporte con ROLLUP
  getReporteFinancieroRollup(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/financiero-rollup`);
  }

  // src/services/reportes-service.ts

  // ... (métodos existentes) ...

  // 4. Reporte de Comisiones (Usa la función Cursor del backend)
  getComisionesMensuales(mes?: number, anio?: number): Observable<any> {
    let params: any = {};
    if (mes) params.mes = mes;
    if (anio) params.anio = anio;
    
    // Retorna { periodo: "11/2025", datos: [...] }
    return this.http.get<any>(`${this.apiUrl}/comisiones`, { params });
  }
}