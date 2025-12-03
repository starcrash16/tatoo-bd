import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FuncionesResumenService {
  private apiUrl = 'http://localhost:3000/api/funciones_resumen';

  constructor(private http: HttpClient) {}

  getFuncionesResumen(): Observable<{ sum_ingresos_anuales: number; avg_pago_anual: number; decode_clasificacion: { alto: number; medio: number; bajo: number; } }>
  {
    console.log('[FuncionesResumenService] Solicitando:', this.apiUrl);
    const obs = this.http.get<{ sum_ingresos_anuales: number; avg_pago_anual: number; decode_clasificacion: { alto: number; medio: number; bajo: number; } }>(this.apiUrl)
      .pipe(
        tap((data) => {
          console.log('[FuncionesResumenService] Respuesta OK:', data);
        }),
        catchError((err) => {
          console.error('[FuncionesResumenService] Error en solicitud:', err);
          throw err;
        })
      );
    return obs;
  }
}