import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { DatabaseService } from '../../services/database.service';
import { RecaptchaModule } from 'ng-recaptcha';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-paciente',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.css'
})
export class PacienteComponent {
  private fb = inject(FormBuilder);
  db = inject(DatabaseService);
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
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async registrarPaciente() {
    const { email, password, nombre, apellido, edad, dni, obra_social } = this.registroForm.value;
    const url1 = await this.db.guardarFoto(this.foto_1, nombre);
    const url2 = await this.db.guardarFoto(this.foto_2, nombre);

    if(url1 && url2){
      this.db.agregarPaciente(email,nombre,apellido,edad,dni,'paciente',obra_social,url1,url2);
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

  captchaResuelto: boolean = false;

verificarCaptcha() {
  if (this.captchaResuelto) {
    this.registrarPaciente();
  }else{
    Swal.fire({
        title: "Error!",
        text: "Tenes que verificar el captcha",
        icon: "error",
        confirmButtonText: 'Entendido',
        scrollbarPadding: false
      })
  }
}

onCaptchaResuelto(token: string | null) {
  if (token) {
    this.captchaResuelto = true;

  }
}

}
