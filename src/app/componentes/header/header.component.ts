import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
auth = inject(AuthService);

salir(){
    this.auth.cerrarSesion();
    Swal.fire({
                title: "¡Cesión cerrada!",
                text: "Redirigiendo al login",
                icon: "info",
                allowOutsideClick: true, 
                allowEscapeKey: false,
                showConfirmButton: false,
              })
  }
}
