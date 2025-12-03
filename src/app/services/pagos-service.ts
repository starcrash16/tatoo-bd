import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private apiUrl = 'http://localhost:3000/api/pagos';

  constructor(private http: HttpClient) { }

  getPagos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
  // Opcional: Obtener un pago específico
  getPagoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/pagos/${id}`);
  }
}