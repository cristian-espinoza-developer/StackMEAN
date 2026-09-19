import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ApiError, toApiError } from '../../core/api';
import { Empleado } from '../empleado';
import { EmpleadoForm } from '../empleado-form/empleado-form';
import { EmpleadoService } from '../empleado.service';

@Component({
  selector: 'app-empleado-list',
  imports: [CurrencyPipe, DatePipe, EmpleadoForm],
  templateUrl: './empleado-list.html',
  styleUrl: './empleado-list.css'
})
export class EmpleadoList {
  private readonly service = inject(EmpleadoService);

  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<ApiError | null>(null);
  protected readonly filtro = signal('');

  /** `undefined`: formulario cerrado · `null`: nuevo · `Empleado`: edición. */
  protected readonly enFormulario = signal<Empleado | null | undefined>(undefined);
  protected readonly porEliminar = signal<Empleado | null>(null);
  protected readonly eliminando = signal(false);
  protected readonly aviso = signal<string | null>(null);

  protected readonly visibles = computed(() => {
    const q = this.filtro().trim().toLowerCase();
    if (!q) return this.empleados();
    return this.empleados().filter((e) =>
      [e.nombre, e.cargo, e.departamento].some((v) => v.toLowerCase().includes(q))
    );
  });

  protected readonly totalSueldos = computed(() => this.visibles().reduce((s, e) => s + e.sueldo, 0));

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.service.listar().subscribe({
      next: (lista) => {
        this.empleados.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(toApiError(err));
        this.cargando.set(false);
      }
    });
  }

  protected onGuardado(e: Empleado): void {
    const creando = this.enFormulario() === null;
    this.enFormulario.set(undefined);
    this.mostrarAviso(creando ? `Empleado «${e.nombre}» creado` : `Empleado «${e.nombre}» actualizado`);
    this.cargar();
  }

  protected confirmarEliminar(): void {
    const e = this.porEliminar();
    if (!e) return;
    this.eliminando.set(true);
    this.service.eliminar(e.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.porEliminar.set(null);
        this.mostrarAviso(`Empleado «${e.nombre}» eliminado`);
        this.cargar();
      },
      error: (err) => {
        this.eliminando.set(false);
        this.porEliminar.set(null);
        this.error.set(toApiError(err));
      }
    });
  }

  protected onFiltro(event: Event): void {
    this.filtro.set((event.target as HTMLInputElement).value);
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3500);
  }
}
