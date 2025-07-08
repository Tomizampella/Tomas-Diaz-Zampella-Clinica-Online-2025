import { Routes } from "@angular/router";

const routes: Routes = [
    { path: 'solicitar-turno', loadComponent: () => import("../../componentes/solicitar-turno/solicitar-turno.component").then((archivo) => archivo.SolicitarTurnoComponent), data: { animation: 'sol-turno' } },
    { path: 'mi-perfil', loadComponent: () => import("../../componentes/mi-perfil/mi-perfil.component").then((archivo) => archivo.MiPerfilComponent), data: { animation: 'perfil' } },
    { path: 'mis-turnos', loadComponent: () => import("../../componentes/mis-turnos/mis-turnos.component").then((archivo) => archivo.MisTurnosComponent), data: { animation: 'mis-turn' } },
]
export {routes};