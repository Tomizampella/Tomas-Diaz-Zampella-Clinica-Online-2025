import { Component, inject } from '@angular/core';
import { Especialidad, TurnoEntry, Usuario } from '../../interfaces/turnos.model';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

interface DiaDisp { fecha: Date; }
type Horario = string; // '08:00', '14:30', etc.

@Component({
  selector: 'app-solicitar-turno',
  imports: [CommonModule],
  templateUrl: './solicitar-turno.component.html',
  styleUrl: './solicitar-turno.component.css'
})
export default class SolicitarTurnoComponent {
  auth = inject(AuthService);
  especialidades: Especialidad[] = [];
  profesionales: Usuario[] = [];
  diasDisponibles: DiaDisp[] = [];
  horariosDisponibles: Horario[] = [];

  selectedEsp?: Especialidad;
  selectedProf?: Usuario;
  selectedProfNombreApellido: string = '';
  selectedDia?: DiaDisp;
  selectedHorario?: Horario;
  selectedPaciente: string = '';

  pacientes: { id: string; nombre: string; apellido: string }[] = [];
  rolUsuario: string = '';

  constructor(private db: DatabaseService) { }

  async ngOnInit() {
    this.rolUsuario = this.auth.rolUsuario;
    this.especialidades = await this.db.getEspecialidades();
    await this.obtenerPacientes();

    if (this.rolUsuario === 'paciente') {
      this.selectedPaciente = this.auth.idUsuario;
    }
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
    this.selectedProfNombreApellido = `${prof.nombre} ${prof.apellido}`;
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
    console.log(this.selectedPaciente);
  }

  selectPaciente(id_paciente: string) {
    this.selectedPaciente = id_paciente;
  }

  async reservarTurno() {
    if (!this.selectedProf || !this.selectedEsp || !this.selectedDia || !this.selectedHorario) {
      return;
    }

    const entry: TurnoEntry = {
      paciente_id: this.selectedPaciente,
      especialista_id: this.selectedProf.id,
      especialidad: this.selectedEsp!.nombre,
      fecha: this.selectedDia!.fecha.toISOString().substring(0, 10),
      hora: this.selectedHorario
    };

    const creado = await this.db.crearTurno(entry);

    if (creado) {
      let mensaje = `Turno para <strong>${entry.especialidad}</strong> 
      el <strong>${this.formatFecha(this.selectedDia!.fecha)}</strong>
       a las <strong>${this.formatHorario(entry.hora)}</strong><br>
      Con el Dr. <strong>${this.selectedProfNombreApellido}</strong>`;
      Swal.fire({
        title: "Turno reservado",
        html: mensaje,
        icon: "success",
        confirmButtonText: "OK",
        scrollbarPadding: false
      });

      // ✅ Resetear selección
      this.selectedEsp = undefined;
      this.selectedProf = undefined;
      this.selectedProfNombreApellido = '';
      this.selectedDia = undefined;
      this.selectedHorario = undefined;

      // Si es admin, también reinicia paciente
      if (this.rolUsuario === 'administrador') {
        this.selectedPaciente = '';
      }
    }
  }

  // Habilita el botón Guardar solo si hay una selección en cada grupo
  canGuardar(): boolean {
    return !!(this.selectedProf && this.selectedEsp && this.selectedDia && this.selectedHorario && this.selectedPaciente);
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

  formatFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}`;
  }

  async obtenerPacientes() {
    this.pacientes = await this.db.traerTodosLosPacientes();
    console.log(this.pacientes);
  }


  // Devuelve el nombre completo del paciente seleccionado para mostrar en el botón
  selectedPacienteName(): string | null {
    const p = this.pacientes.find(x => x.id === this.selectedPaciente);
    return p ? `${p.nombre} ${p.apellido}` : null;
  }

}