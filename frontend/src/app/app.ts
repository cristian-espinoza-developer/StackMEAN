import { Component } from '@angular/core';
import { EmpleadoList } from './empleados/empleado-list/empleado-list';

@Component({
  selector: 'app-root',
  imports: [EmpleadoList],
  template: `
    <header>
      <h1>Gestión de empleados</h1>
      <p>Administra el personal: consulta, crea, edita y elimina registros.</p>
    </header>
    <main>
      <app-empleado-list />
    </main>
  `,
  styles: `
    header { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 1rem; }
    h1 { margin: 0 0 .25rem; font-size: 1.75rem; }
    p { margin: 0; color: var(--muted); }
    main { max-width: 1100px; margin: 0 auto; padding: 1rem 1rem 3rem; }
  `
})
export class App {}
