export interface Empleado {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt: string;
  updatedAt: string;
}

export type EmpleadoInput = Pick<Empleado, 'nombre' | 'cargo' | 'departamento' | 'sueldo'>;
