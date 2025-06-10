import { Component} from '@angular/core';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxCaptchaModule } from 'ngx-captcha';
import { RegistroEspecialistaComponent } from "../../componentes/registro-especialista/registro-especialista.component";

@Component({
  selector: 'app-especialista',
  imports: [HeaderComponent, FooterComponent, ReactiveFormsModule, FormsModule, CommonModule, NgxCaptchaModule, RegistroEspecialistaComponent],
  templateUrl: './especialista.component.html',
  styleUrl: './especialista.component.css'
})
export class EspecialistaComponent {
}
