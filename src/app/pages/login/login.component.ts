import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DatabaseService } from '../../services/database.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
// auth = inject(AuthService);
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  db = inject(DatabaseService);
  mensaje:string = '';
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  async loguearse() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // muestra errores si hay campos sin tocar
      return;
    }
    const { email, password } = this.loginForm.value;
    const aprobacion_admin = await this.db.verificarAprobacionAdmin(email);

    if(!aprobacion_admin){
      Swal.fire({
        title: "Error!",
        text: "¡El administrador todavía no aprobó su cuenta!",
        icon: "error",
        confirmButtonText: 'Entendido',
        scrollbarPadding: false
      })
      return;
    }
    // 🔐 Si todo está bien, ahora sí iniciamos sesión
    const resultado = await this.auth.iniciarSesion(email, password);

    if (!resultado.success) {
      if (resultado.error === 'Invalid login credentials') {
        this.mensaje = "¡Usuario y/o contraseña incorrectos!";
      } else if ((resultado.error === 'Email not confirmed')){
        this.mensaje = "¡Correo no verificado!";
      }
      Swal.fire({
      title: "Error!",
      text: this.mensaje,
      icon: "error",
      confirmButtonText: 'Entendido',
      scrollbarPadding: false
    })
      return;
    }
  }

  autocompletar(email: string, password: string) {
    this.loginForm.patchValue({ email, password });
  }
}
