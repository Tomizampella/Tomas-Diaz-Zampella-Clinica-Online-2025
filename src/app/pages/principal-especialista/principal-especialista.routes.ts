import { Routes } from "@angular/router";

const routes: Routes = [
    { path: 'mi-perfil', loadComponent: () => import("../../componentes/mi-perfil/mi-perfil.component").then((archivo) => archivo.MiPerfilComponent) },
    { path: 'mis-turnos', loadComponent: () => import("../../componentes/mis-turnos/mis-turnos.component").then((archivo) => archivo.MisTurnosComponent) },
]
export {routes};