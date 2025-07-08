import { Routes } from "@angular/router";

const routes: Routes = [
    { path: 'mi-perfil', loadComponent: () => import("../../componentes/mi-perfil/mi-perfil.component").then((archivo) => archivo.MiPerfilComponent), data: { animation: 'perfil' } },
    { path: 'mis-turnos', loadComponent: () => import("../../componentes/mis-turnos/mis-turnos.component").then((archivo) => archivo.MisTurnosComponent), data: { animation: 'turnos' } },
    { path: 'seccion-pacientes', loadComponent: () => import("../../componentes/seccion-pacientes/seccion-pacientes.component").then((archivo) => archivo.SeccionPacientesComponent), data: { animation: 'pacientes' } }
]
export {routes};