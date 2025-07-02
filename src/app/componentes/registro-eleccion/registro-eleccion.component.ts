import { Component } from '@angular/core';
import { RegistroPacienteComponent } from '../registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from '../registro-especialista/registro-especialista.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro-eleccion',
  imports: [RegistroPacienteComponent, RegistroEspecialistaComponent, CommonModule],
  templateUrl: './registro-eleccion.component.html',
  styleUrl: './registro-eleccion.component.css'
})
export class RegistroEleccionComponent {
  modo: 'ninguno' | 'paciente' | 'especialista' = 'ninguno';

  mostrarPaciente() {
    this.modo = 'paciente';
  }

  mostrarEspecialista() {
    this.modo = 'especialista';
  }

  volver() {
    this.modo = 'ninguno';
  }
}
