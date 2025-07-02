import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

interface Horario {
  label: string;
  start: string;
  end: string;
}

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export default class MiPerfilComponent {
  db = inject(DatabaseService);
  auth = inject(AuthService);
  objUsuario: any = null;
  modo: 'perfil' | 'horarios' = 'perfil';
  correoUsuario:string = '';

  // Estado de selección
  selectedEspecialidad: string | null = null;
  selectedDia: number | null = null;
  selectedHorario: Horario | null = null;

  // Datos de los botones
  dias = ['L', 'M', 'M', 'J', 'V', 'S'];
  horarios: Horario[] = [
    { label: '08 a 14hs.', start: '08:00', end: '14:00' },
    { label: '14 a 20hs.', start: '14:00', end: '20:00' },
    { label: '12 a 16hs.', start: '12:00', end: '16:00' },
    { label: '16 a 20hs.', start: '16:00', end: '20:00' },
  ];

  mostrarHorarios() { this.modo = 'horarios'; }
  mostrarPerfil()   { this.modo = 'perfil';   }

  constructor(){
    this.correoUsuario = this.auth.correoUsuario;
  }

  async ngOnInit() {
    this.objUsuario = await this.db.traerUsuario(this.correoUsuario);
  }

  // Handlers de selección
  selectEspecialidad(esp: string) {
    this.selectedEspecialidad = this.selectedEspecialidad === esp ? null : esp;
  }
  selectDia(dia: number) {
    this.selectedDia = this.selectedDia === dia ? null : dia;
  }
  selectHorario(h: Horario) {
    this.selectedHorario = this.selectedHorario === h ? null : h;
  }

  // Habilita el botón Guardar solo si hay una selección en cada grupo
  canGuardar(): boolean {
    return !!(this.selectedEspecialidad && this.selectedDia && this.selectedHorario);
  }

  // Guardar la disponibilidad en la base
  async guardarHorario() {
    if (!this.canGuardar()) return;

    const entry = {
      usuario_id: this.objUsuario.id,
      especialidad: this.selectedEspecialidad!,
      dia_semana: this.selectedDia!,
      hora_inicio: this.selectedHorario!.start,
      hora_fin: this.selectedHorario!.end
    };
    await this.db.guardarDisponibilidad(entry);

    // Podés resetear selección o mostrar un mensaje
    this.selectedEspecialidad = null;
    this.selectedDia = null;
    this.selectedHorario = null;
  }
}
