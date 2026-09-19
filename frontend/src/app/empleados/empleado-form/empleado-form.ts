import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError, toApiError } from '../../core/api';
import { Empleado } from '../empleado';
import { EmpleadoService } from '../empleado.service';

@Component({
  selector: 'app-empleado-form',
  imports: [ReactiveFormsModule],
  templateUrl: './empleado-form.html',
  styleUrl: './empleado-form.css'
})
export class EmpleadoForm {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly service = inject(EmpleadoService);

  /** Empleado a editar; `null` significa crear uno nuevo. */
  readonly empleado = input<Empleado | null>(null);
  readonly guardado = output<Empleado>();
  readonly cancelado = output<void>();

  protected readonly editando = computed(() => this.empleado() !== null);
  protected readonly enviando = signal(false);
  protected readonly error = signal<ApiError | null>(null);

  protected readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    cargo: ['', [Validators.required, Validators.maxLength(100)]],
    departamento: ['', [Validators.required, Validators.maxLength(100)]],
    sueldo: [null as number | null, [Validators.required, Validators.min(0.01), Validators.max(1_000_000_000)]]
  });

  constructor() {
    effect(() => {
      const e = this.empleado();
      this.error.set(null);
      this.form.reset(
        e
          ? { nombre: e.nombre, cargo: e.cargo, departamento: e.departamento, sueldo: e.sueldo }
          : { nombre: '', cargo: '', departamento: '', sueldo: null }
      );
    });
  }

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { nombre, cargo, departamento, sueldo } = this.form.getRawValue();
    const data = { nombre: nombre.trim(), cargo: cargo.trim(), departamento: departamento.trim(), sueldo: Number(sueldo) };
    const actual = this.empleado();

    this.enviando.set(true);
    this.error.set(null);
    const peticion = actual ? this.service.actualizar(actual.id, data) : this.service.crear(data);
    peticion.subscribe({
      next: (e) => {
        this.enviando.set(false);
        this.guardado.emit(e);
      },
      error: (err) => {
        this.enviando.set(false);
        this.error.set(toApiError(err));
      }
    });
  }
}
