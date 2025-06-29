import { Component } from '@angular/core';
import { Especialidad, TurnoEntry, Usuario } from '../../interfaces/turnos.model';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';

interface DiaDisp     { fecha: Date; }
type   Horario       = string; // '08:00', '14:30', etc.

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export default class SolicitarTurnoComponent {
  especialidades: Especialidad[] = [];
  profesionales: Usuario[]      = [];
  diasDisponibles: DiaDisp[]    = [];
  horariosDisponibles: Horario[] = [];

  selectedEsp?: Especialidad;
  selectedProf?: Usuario;
  selectedDia?: DiaDisp;
  selectedHorario?: Horario;

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    this.especialidades = await this.db.getEspecialidades();
  }

  async selectEspecialidad(esp: Especialidad) {
    this.selectedEsp = esp;
    this.selectedProf = undefined;
    this.selectedDia = undefined;
    this.selectedHorario = undefined;
    this.profesionales = await this.db.getProfesionalesPorEspecialidad(esp.nombre);
  }

  async selectProfesional(prof: Usuario) {
    this.selectedProf = prof;
    this.selectedDia = undefined;
    this.selectedHorario = undefined;

    // 1) Crear array de próximos 15 días
    const hoy = new Date();
    const proximos15: Date[] = [];
    for (let i = 0; i < 15; i++) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() + i);
      proximos15.push(d);
    }

    // 2) Traer disponibilidad del especialista
    const dispo = await this.db.getDisponibilidad(prof.id, this.selectedEsp!.nombre);

    // 3) Filtrar los próximos 15 días que coincidan con dia_semana
    //    r.dia_semana: 1=Lunes ... 7=Domingo
    this.diasDisponibles = proximos15
      .filter(d => {
        const weekday = d.getDay() === 0 ? 7 : d.getDay();
        return dispo.some(r => r.dia_semana === weekday);
      })
      .map(d => ({ fecha: d }));
  }

  async selectDia(d: DiaDisp) {
    this.selectedDia = d;
    this.selectedHorario = undefined;

    // 4) Traer de nuevo las franjas y generar horarios por hora
    const dispo = await this.db.getDisponibilidad(this.selectedProf!.id, this.selectedEsp!.nombre);
    const weekday = d.fecha.getDay() === 0 ? 7 : d.fecha.getDay();

    // Para cada registro de disponibilidad en ese día, generamos horas
    const horas: Horario[] = [];
    dispo
      .filter(r => r.dia_semana === weekday)
      .forEach(r => {
        // Convertimos a minutos
        const [hiH, hiM] = r.hora_inicio.split(':').map(n => parseInt(n, 10));
        const [hfH, hfM] = r.hora_fin.split(':').map(n => parseInt(n, 10));
        let current = hiH * 60 + hiM;
        const end = hfH * 60 + hfM;
        while (current + 0 < end) {
          const h = Math.floor(current / 60).toString().padStart(2, '0');
          const m = (current % 60).toString().padStart(2, '0');
          horas.push(`${h}:${m}:00`);
          current += 60; // saltamos de hora en hora
        }
      });

    // Eliminamos duplicados y asignamos
    this.horariosDisponibles = Array.from(new Set(horas));
  }

  selectHorario(h: Horario) {
    this.selectedHorario = h;
    // Ahora podés reservar
    // this.reservarTurno();
  }

  async reservarTurno() {
    if (!this.selectedProf || !this.selectedEsp || !this.selectedDia || !this.selectedHorario) {
      return;
    }
    const entry: TurnoEntry = {
      paciente_id: '3a6d685a-c24f-47ed-8bd3-e884add87d69', //Cambiar este id
      especialista_id: this.selectedProf.id,
      especialidad: this.selectedEsp!.nombre,
      fecha: this.selectedDia!.fecha.toISOString().substring(0, 10), // YYYY-MM-DD
      hora: this.selectedHorario
    };
    await this.db.crearTurno(entry);
    // Opcional: resetear selección o navegar
  }

  // Habilita el botón Guardar solo si hay una selección en cada grupo
  canGuardar(): boolean {
    return !!(this.selectedProf && this.selectedEsp && this.selectedDia && this.selectedHorario);
  }

  /** Convierte "HH:MM:SS" a formato "h:mmam" / "h:mmpm" */
formatHorario(h: string): string {
  const [hh, mm] = h.split(':');
  let hour = parseInt(hh, 10);
  const minute = mm.padStart(2, '0');
  const period = hour < 12 ? 'am' : 'pm';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute}${period}`;
}
}