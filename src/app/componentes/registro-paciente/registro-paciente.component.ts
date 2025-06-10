import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-paciente',
  imports: [ReactiveFormsModule, NgxCaptchaModule],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.css'
})
export class RegistroPacienteComponent {
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
    obra_social: ['', Validators.required],
    foto_1: ['', Validators.required],
    foto_2: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    recaptcha: ['', Validators.required]
  });

  async registrarPaciente() {
    const { email, password, nombre, apellido, edad, dni, obra_social} = this.registroForm.value;
    const url1 = await this.db.guardarFoto(this.foto_1, nombre);
    const url2 = await this.db.guardarFoto(this.foto_2, nombre);

    if(url1 && url2){
      const creacionUsuario = await this.auth.crearCuenta(email, password, nombre);
      if(creacionUsuario){
        this.db.agregarPaciente(email,nombre,apellido,edad,dni,'paciente',obra_social,url1,url2);
        this.router.navigateByUrl('/login');
      }
    }

  }


  onArchivoSelecionado(event: Event, tipo: 'foto_1' | 'foto_2') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      if (tipo === 'foto_1') {
        this.foto_1 = archivo;
      } else {
        this.foto_2 = archivo;
      }
    }
  }

 

}