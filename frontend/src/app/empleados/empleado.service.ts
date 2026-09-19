import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL, ApiSuccess } from '../core/api';
import { Empleado, EmpleadoInput } from './empleado';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/empleados`;

  listar(): Observable<Empleado[]> {
    return this.http.get<ApiSuccess<Empleado[]>>(this.url).pipe(map((r) => r.data));
  }

  crear(data: EmpleadoInput): Observable<Empleado> {
    return this.http.post<ApiSuccess<Empleado>>(this.url, data).pipe(map((r) => r.data));
  }

  actualizar(id: string, data: Partial<EmpleadoInput>): Observable<Empleado> {
    return this.http.put<ApiSuccess<Empleado>>(`${this.url}/${id}`, data).pipe(map((r) => r.data));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<ApiSuccess<{ id: string }>>(`${this.url}/${id}`).pipe(map(() => undefined));
  }
}
