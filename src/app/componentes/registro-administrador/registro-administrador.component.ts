import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-administrador',
  imports: [ReactiveFormsModule, NgxCaptchaModule],
  templateUrl: './registro-administrador.component.html',
  styleUrl: './registro-administrador.component.css'
})
export default class RegistroAdministradorComponent {
  private fb = inject(FormBuilder);
  db = inject(DatabaseService);
  auth = inject(AuthService);
  router = inject(Router);
  foto_1!: File;
  foto_2!: File;
  registroForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    edad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    foto_1: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    recaptcha: ['', Validators.required]
  });

  async registrarAdministrador() {
    const { email, password, nombre, apellido, edad, dni} = this.registroForm.value;
    const url1 = await this.db.guardarFoto(this.foto_1, nombre);

    if(url1){
      const creacionUsuario = await this.auth.crearCuenta(email, password, nombre);
      if(creacionUsuario){
        this.db.agregarAdministrador(email,nombre,apellido,edad,dni,'administrador',url1);
        this.router.navigateByUrl('/login');
      }
    }

  }


  onArchivoSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      this.foto_1 = archivo;
    }
  }


 

}