import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { EspecialistaComponent } from './pages/especialista/especialista.component';
import { SeccionUsuariosComponent } from './pages/seccion-usuarios/seccion-usuarios.component';

export const routes: Routes = [
    {
        path: "",
        redirectTo: "home",
        pathMatch: "full"
    },
    {
        path: "home",
        component: HomeComponent
    },
    {
        path: "registro",
        component: RegistroComponent
    },
    {
        path: "login",
        component: LoginComponent
    },
    {
        path: "paciente",
        component: PacienteComponent
    },
    {
        path: "especialista",
        component: EspecialistaComponent
    },
    {
        path: "seccion-usuarios",
        component: SeccionUsuariosComponent,
        children:[
            {
                path: 'agregar-admin',
                loadComponent: () => import('./componentes/registro-administrador/registro-administrador.component')
            },
            {
                path: 'agregar-usuario',
                loadComponent: () => import('./componentes/registro-eleccion/registro-eleccion.component')
            }
        ]
    }
];
