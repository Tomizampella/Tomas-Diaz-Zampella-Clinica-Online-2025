import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
import Swal from 'sweetalert2';
import { NgxCaptchaModule } from 'ngx-captcha';

@Component({
  selector: 'app-especialista',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, FormsModule, CommonModule, NgxCaptchaModule],
  templateUrl: './especialista.component.html',
  styleUrl: './especialista.component.css'
})
export class EspecialistaComponent {
private fb = inject(FormBuilder);
 db = inject(DatabaseService);
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
   const { email, password, nombre, apellido, edad, dni, obra_social } = this.registroForm.value;
    const url1 = await this.db.guardarFoto(this.foto_1, nombre);
    // console.log(`url desde registrarEspecialista: ${url1}`);

    if(url1){
      this.db.agregarEspecialista(email,nombre,apellido,edad,dni,'especialista',this.especialidadesSeleccionadas,url1);
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
