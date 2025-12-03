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

  getFuncionesResumen(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}