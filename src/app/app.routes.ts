import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { EspecialistaComponent } from './pages/especialista/especialista.component';
import { SeccionUsuariosComponent } from './pages/seccion-usuarios/seccion-usuarios.component';
import { PrincipalPacienteComponent } from './pages/principal-paciente/principal-paciente.component';
import { PrincipalEspecialistaComponent } from './pages/principal-especialista/principal-especialista.component';
import { RedireccionComponent } from './pages/redireccion/redireccion.component';


export const routes: Routes = [
    {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
    },
    { path: 'home', loadComponent: () => import("./pages/home/home.component").then((archivo) => archivo.HomeComponent)},
    { path: 'registro', loadComponent: () => import("./pages/registro/registro.component").then((archivo) => archivo.RegistroComponent) },
    { path: 'login', loadComponent: () => import("./pages/login/login.component").then((archivo) => archivo.LoginComponent) },
    { path: 'redireccion', loadComponent: () => import("./pages/redireccion/redireccion.component").then((archivo) => archivo.RedireccionComponent) },
    { path: 'registro-paciente', loadComponent: () => import("./pages/paciente/paciente.component").then((archivo) => archivo.PacienteComponent) },
    { path: 'registro-especialista', loadComponent: () => import("./pages/especialista/especialista.component").then((archivo) => archivo.EspecialistaComponent) },
    {
        path: "seccion-usuarios",
        component: SeccionUsuariosComponent,
        loadChildren: () => import("./pages/seccion-usuarios/seccion-usuarios.routes").then((archivo)=> archivo.routes)
        
    },
    {
        path: "paciente",
        component: PrincipalPacienteComponent,
        loadChildren: () => import("./pages/principal-paciente/principal-paciente.routes").then((archivo)=> archivo.routes)
    },
    {
        path: "especialista",
        component: PrincipalEspecialistaComponent,
        loadChildren: () => import("./pages/principal-especialista/principal-especialista.routes").then((archivo)=> archivo.routes)
    },
    { path: '**', redirectTo: 'redireccion' }
];
