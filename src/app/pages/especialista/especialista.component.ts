import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../services/database.service';
import Swal from 'sweetalert2';
import { NgxCaptchaModule } from 'ngx-captcha';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RegistroEspecialistaComponent } from "../../componentes/registro-especialista/registro-especialista.component";

@Component({
  selector: 'app-especialista',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, FormsModule, CommonModule, NgxCaptchaModule, RegistroEspecialistaComponent],
  templateUrl: './especialista.component.html',
  styleUrl: './especialista.component.css'
})
export class EspecialistaComponent {
}
