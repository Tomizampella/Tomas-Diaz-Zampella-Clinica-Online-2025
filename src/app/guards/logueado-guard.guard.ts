import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

export const logueadoGuardGuard: CanActivateFn = async (route, state) => {
   const auth = inject(AuthService);
  const router = inject(Router);

  // Esperar hasta que se haya verificado la sesión
  while (!auth.isSesionVerificada) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (auth.usuarioActual === null) {
    if (state.url !== '/home') {
      router.navigate(['/home']);
      await Swal.fire({
        text: '¡No iniciaste sesión!',
        icon: 'info',
        scrollbarPadding: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }

    return false;
  }

  return true;
};
