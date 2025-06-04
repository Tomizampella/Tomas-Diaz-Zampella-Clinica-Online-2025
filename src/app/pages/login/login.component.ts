import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
// auth = inject(AuthService);
  fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loguearse() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // muestra errores si hay campos sin tocar
      return;
    }
    console.log("logueando")
    // const { email, password } = this.loginForm.value;
    // this.auth.iniciarSesion(email, password);
  }

  autocompletar(email: string, password: string) {
    this.loginForm.patchValue({ email, password });
  }
}
