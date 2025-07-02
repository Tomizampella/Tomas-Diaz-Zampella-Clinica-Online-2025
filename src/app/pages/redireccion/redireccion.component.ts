import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-redireccion',
  imports: [],
  templateUrl: './redireccion.component.html',
  styleUrl: './redireccion.component.css'
})
export class RedireccionComponent {
  auth = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    setTimeout(() => {
      const rol = this.auth.rolUsuario;
      if (rol === 'paciente') {
        this.router.navigateByUrl('/paciente');
      } else if (rol === 'especialista') {
        this.router.navigateByUrl('/especialista');
      } else if (rol === 'administrador') {
        this.router.navigateByUrl('/seccion-usuarios');
      }else {
        this.router.navigateByUrl('/home');
      }
    }, 3000);
  }

}
