export interface Employee {
  id: string;
  nombre: string;
  cargo: string;
  departamento: string;
  sueldo: number;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateEmployeeData = Pick<Employee, 'nombre' | 'cargo' | 'departamento' | 'sueldo'>;

export type UpdateEmployeeData = { [K in keyof CreateEmployeeData]?: CreateEmployeeData[K] | undefined };

/** Descarta los campos `undefined` para que nunca sobrescriban valores existentes. */
export const definedFields = (data: UpdateEmployeeData): Partial<CreateEmployeeData> =>
  Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
