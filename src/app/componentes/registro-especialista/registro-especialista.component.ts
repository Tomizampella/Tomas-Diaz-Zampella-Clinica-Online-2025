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

  async agregarEspecialidad() {
  const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  const especialidad = this.nuevaEspecialidad.trim();

  // Validación de solo letras
  if (!soloLetras.test(especialidad)) {
    this.especialidadInvalida = true;
    return;
  }

  this.especialidadInvalida = false;

  // Evitar duplicados en seleccionadas
  if (this.especialidadesSeleccionadas.includes(especialidad)) {
    this.nuevaEspecialidad = '';
    return;
  }

  // Agregar a seleccionadas
  this.especialidadesSeleccionadas.push(especialidad);

  // Si no está en las predefinidas, guardarla en la base de datos
  if (!this.especialidadesPredefinidas.map(e => e.toLowerCase()).includes(especialidad.toLowerCase()))
 {
    try {
      await this.db.agregarEspecialidad(especialidad);
    } catch (error) {
      console.error('No se pudo guardar la especialidad personalizada:', error);
    }
  }

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
        this.auth.sb.supabase.auth.signOut()
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

