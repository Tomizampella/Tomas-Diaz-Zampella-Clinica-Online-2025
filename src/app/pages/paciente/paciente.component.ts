import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { DatabaseService } from '../../services/database.service';
import Swal from 'sweetalert2';
import { NgxCaptchaModule } from 'ngx-captcha';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RegistroPacienteComponent } from '../../componentes/registro-paciente/registro-paciente.component';

@Component({
  selector: 'app-paciente',
  imports: [HeaderComponent, FooterComponent, RegistroPacienteComponent, ReactiveFormsModule, NgxCaptchaModule],
  templateUrl: './paciente.component.html',
  styleUrl: './paciente.component.css'
})
export class PacienteComponent {


}
