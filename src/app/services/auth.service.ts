import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DatabaseService } from './database.service';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  sb = inject(SupabaseService);
  db = inject(DatabaseService);
  router = inject(Router);
  idUsuario: string = '';
  nombreUsuario: string = '';
  usuarioActual: User | null = null;
  primerInicio: boolean = false;
  isSesionVerificada: boolean = false;
  rolUsuario: string = '';
  correoUsuario:string = '';
  objUsuario: any = null;
  constructor() {
    // Verificar sesión actual (por si se refresca la página y ya estaba logueado)
    this.sb.supabase.auth.getSession().then(({ data }) => {
      this.usuarioActual = data.session?.user ?? null;
      this.isSesionVerificada = true;

      if (this.usuarioActual) {
        this.nombreUsuario = this.usuarioActual.user_metadata?.['nombre_usuario'];

        if (this.idUsuario === '') {
          this.db.tablaUsuarios
            .select('*')
            .eq('email', this.usuarioActual.email)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error al obtener usuario:', error.message);
                return;
              }

              this.idUsuario = data.id;
              this.rolUsuario = data.rol;
              this.correoUsuario = data.email;
              this.objUsuario = data;
              
            });
        }
      }
    });

    // Escuchar cambios en el estado de autenticación
    this.sb.supabase.auth.onAuthStateChange((event, session) => {


      if (event === 'SIGNED_OUT') {
        this.usuarioActual = null;
        this.isSesionVerificada = false;
        this.idUsuario = '';
        this.rolUsuario = '';
        this.correoUsuario = '';
        this.objUsuario = null;
        this.router.navigateByUrl('/home');
      } else if (session === null) {
        this.usuarioActual = null;
      } else {
        this.usuarioActual = session.user;

        if (event === 'SIGNED_IN' && !this.primerInicio) {
          this.router.navigateByUrl('/paciente');
          this.primerInicio = true;
        }

        this.nombreUsuario = this.usuarioActual.user_metadata?.['nombre_usuario'];

        if (this.idUsuario === '') {
          this.db.tablaUsuarios
            .select('*')
            .eq('email', this.usuarioActual.email)
            .single()
            .then(({ data, error }) => {
              if (error) {
                console.error('Error al obtener usuario:', error.message);
                return;
              }

              this.idUsuario = data.id;
              this.rolUsuario = data.rol;
              this.correoUsuario = data.email;
              this.objUsuario = data;
             
            });
        }
      }

      // Siempre marcar como verificado después de recibir cualquier evento
      this.isSesionVerificada = true;
    });
  }

  //crear cuenta
  async crearCuenta(correo: string, contraseña: string, nombreUsuario: string) {
    const correoMinuscula = correo.toLowerCase();
    //Auth
    const { data, error } = await this.sb.supabase.auth.signUp({
      email: correoMinuscula,
      password: contraseña,
      options: {
        data: {
          nombre_usuario: nombreUsuario  // o "username", como prefieras nombrarlo
        }
      }
    });

    if (error?.message === "User already registered") {
      Swal.fire({
        title: "Error!",
        text: "¡El email ya se encuentra asociado a una cuenta!",
        icon: "error",
        confirmButtonText: 'Entendido',
        scrollbarPadding: false
      })
      return false;
    }
    return true;

  }

  //iniciar sesion
  async iniciarSesion(correo: string, contraseña: string): Promise<{ success: boolean; error?: string }> {

    const { data, error } = await this.sb.supabase.auth.signInWithPassword({
      email: correo,
      password: contraseña
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };

  }

  //cerrar sesion
  async cerrarSesion() {
    const { error } = await this.sb.supabase.auth.signOut();
  }
}
