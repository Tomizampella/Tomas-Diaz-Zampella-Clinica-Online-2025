import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxCaptchaModule } from 'ngx-captcha';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro-especialista',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgxCaptchaModule],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.css'
})
export class RegistroEspecialistaComponent {
private fb = inject(FormBuilder);
db = inject(DatabaseService);
auth = inject(AuthService);
router = inject(Router);
foto_1!: File;

  registroForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    edad: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
    foto_1: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    recaptcha: ['', Validators.required],
  });

  // Lista de especialidades predefinidas
  especialidadesPredefinidas: string[] = [
    'Cardiología', 'Pediatría', 'Odontología', 'Neurología', 'Oftalmología', 'Traumatología'
  ];

  // Especialidades seleccionadas y personalizada
  especialidadesSeleccionadas: string[] = [];
  nuevaEspecialidad: string = '';
  especialidadInvalida: boolean = false;

  actualizarEspecialidades(selected: string[]) {
    this.especialidadesSeleccionadas = [...selected];
  }

  agregarEspecialidad() {
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  if (!soloLetras.test(this.nuevaEspecialidad.trim())) {
    this.especialidadInvalida = true;
    return;
  }

  // Si pasa la validación
  this.especialidadInvalida = false;

  // Agregar la especialidad si es válida
  this.especialidadesSeleccionadas.push(this.nuevaEspecialidad.trim());
  this.nuevaEspecialidad = '';
}

  eliminarEspecialidad(especialidad: string) {
    this.especialidadesSeleccionadas = this.especialidadesSeleccionadas.filter(e => e !== especialidad);
  }

  async registrarEspecialista() {
   const { email, password, nombre, apellido, edad, dni} = this.registroForm.value;
    const url1 = await this.db.guardarFoto(this.foto_1, nombre);

    if(url1){
      const creacionEspecialista = await this.auth.crearCuenta(email, password, nombre);
      if(creacionEspecialista){
        this.db.agregarEspecialista(email,nombre,apellido,edad,dni,'especialista',this.especialidadesSeleccionadas,url1);
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

