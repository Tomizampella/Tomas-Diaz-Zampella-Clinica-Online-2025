import { Routes } from "@angular/router";

const routes: Routes = [
    { path: 'agregar-admin', loadComponent: () => import("../../componentes/registro-administrador/registro-administrador.component").then((archivo) => archivo.RegistroAdministradorComponent), data: { animation: 'pipo' }},
    { path: 'agregar-usuario', loadComponent: () => import("../../componentes/registro-eleccion/registro-eleccion.component").then((archivo) => archivo.RegistroEleccionComponent),data: { animation: 'toto' } },
    { path: 'listado-usuarios', loadComponent: () => import("../../componentes/listado-usuarios/listado-usuarios.component").then((archivo) => archivo.ListadoUsuariosComponent),data: { animation: 'list-user' } },
    { path: 'administrar-especialistas', loadComponent: () => import("../../componentes/administrar-especialistas/administrar-especialistas.component").then((archivo) => archivo.AdministrarEspecialistasComponent),data: { animation: 'administrar-espe' } },
     { path: 'solicitar-turno', loadComponent: () => import("../../componentes/solicitar-turno/solicitar-turno.component").then((archivo) => archivo.SolicitarTurnoComponent),data: { animation: 'solicitar-turn' } },
     { path: 'turnos', loadComponent: () => import("../../componentes/turnos-administrador/turnos-administrador.component").then((archivo) => archivo.TurnosAdministradorComponent),data: { animation: 'turnillos' } },
     { path: 'graficos', loadComponent: () => import("../../componentes/graficos/graficos.component").then((archivo) => archivo.GraficosComponent),data: { animation: 'charts' } },
]   
export {routes};