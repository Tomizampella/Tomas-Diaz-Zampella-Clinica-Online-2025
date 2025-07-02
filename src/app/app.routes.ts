import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { PacienteComponent } from './pages/paciente/paciente.component';
import { EspecialistaComponent } from './pages/especialista/especialista.component';
import { SeccionUsuariosComponent } from './pages/seccion-usuarios/seccion-usuarios.component';
import { PrincipalPacienteComponent } from './pages/principal-paciente/principal-paciente.component';
import { PrincipalEspecialistaComponent } from './pages/principal-especialista/principal-especialista.component';


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
        path: "registro-paciente",
        component: PacienteComponent
    },
    {
        path: "registro-especialista",
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
            },
            {
                path: 'listado-usuarios',
                loadComponent: () => import('./componentes/listado-usuarios/listado-usuarios.component')
            },
            {
                path: 'administrar-especialistas',
                loadComponent: () => import('./componentes/administrar-especialistas/administrar-especialistas.component')
            },
            {
                path: 'solicitar-turno',
                loadComponent: () => import('./componentes/solicitar-turno/solicitar-turno.component')
            },
            {
                path: 'turnos',
                loadComponent: () => import('./componentes/turnos-administrador/turnos-administrador.component')
            }
        ]
        
    },
    {
        path: "paciente",
        component: PrincipalPacienteComponent,
        children:[
            {
                path: 'solicitar-turno',
                loadComponent: () => import('./componentes/solicitar-turno/solicitar-turno.component')
            },
            {
                path: 'mi-perfil',
                loadComponent: () => import('./componentes/mi-perfil/mi-perfil.component')
            },
            {
                path: 'mis-turnos',
                loadComponent: () => import('./componentes/mis-turnos/mis-turnos.component')
            }
        ]
    },
    {
        path: "especialista",
        component: PrincipalEspecialistaComponent,
        children:[
            {
                path: 'mi-perfil',
                loadComponent: () => import('./componentes/mi-perfil/mi-perfil.component')
            },
            {
                path: 'mis-turnos',
                loadComponent: () => import('./componentes/mis-turnos/mis-turnos.component')
            }
        ]
    }
];
