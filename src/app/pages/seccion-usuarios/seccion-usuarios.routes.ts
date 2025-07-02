import { Routes } from "@angular/router";

const routes: Routes = [
    { path: 'agregar-admin', loadComponent: () => import("../../componentes/registro-administrador/registro-administrador.component").then((archivo) => archivo.RegistroAdministradorComponent) },
    { path: 'agregar-usuario', loadComponent: () => import("../../componentes/registro-eleccion/registro-eleccion.component").then((archivo) => archivo.RegistroEleccionComponent) },
    { path: 'listado-usuarios', loadComponent: () => import("../../componentes/listado-usuarios/listado-usuarios.component").then((archivo) => archivo.ListadoUsuariosComponent) },
    { path: 'administrar-especialistas', loadComponent: () => import("../../componentes/administrar-especialistas/administrar-especialistas.component").then((archivo) => archivo.AdministrarEspecialistasComponent) },
     { path: 'solicitar-turno', loadComponent: () => import("../../componentes/solicitar-turno/solicitar-turno.component").then((archivo) => archivo.SolicitarTurnoComponent) },
     { path: 'turnos', loadComponent: () => import("../../componentes/turnos-administrador/turnos-administrador.component").then((archivo) => archivo.TurnosAdministradorComponent) },
]
export {routes};