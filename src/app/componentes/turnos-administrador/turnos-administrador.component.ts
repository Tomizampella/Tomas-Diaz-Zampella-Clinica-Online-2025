import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { TextoTachadoPipe } from '../../pipes/texto-tachado.pipe';
import { TextoCursivaDirective } from '../../directives/texto-cursiva.directive';

@Component({
  selector: 'app-turnos-administrador',
  imports: [CommonModule, FormsModule, TextoTachadoPipe, TextoCursivaDirective],
  templateUrl: './turnos-administrador.component.html',
  styleUrl: './turnos-administrador.component.css'
})
export class TurnosAdministradorComponent {
  db = inject(DatabaseService);
  turnos: any[] = [];
  searchTerm: string = ''; 

  ngOnInit() {
    this.obtenerTurnos();
  }

  async obtenerTurnos() {
    this.turnos = await this.db.traerTodosLosTurnos();
    console.log('Turnos: ', this.turnos);
  }

   /** Getter que devuelve solo los turnos que cumplen la búsqueda */
  get filteredTurnos(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.turnos;

    return this.turnos.filter(item => {
      // especialidad
      if (item.especialidad.toLowerCase().includes(term)) {
        return true;
      }
      // nombre del especialista
      const nom = item.especialista?.nombre?.toLowerCase() ?? '';
      if (nom.includes(term)) {
        return true;
      }
      // apellido del especialista
      const ape = item.especialista?.apellido?.toLowerCase() ?? '';
      if (ape.includes(term)) {
        return true;
      }
      return false;
    });
  }

  trackById(index: number, item: any) {
  return item.id;
}


  formatHorario(h: string): string {
    const [hh, mm] = h.split(':');
    let hour = parseInt(hh, 10);
    const minute = mm.padStart(2, '0');
    const period = hour < 12 ? 'am' : 'pm';
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute}${period}`;
  }

  formatearFecha(fechaStr: string): string {
    const [anio, mes, dia] = fechaStr.split('-');
    return `${dia}-${mes}-${anio}`;
  }

  async cancelarTurno(turno: any) {
    const { value: comentarioAdmin } = await Swal.fire({
      title: "¿Por qué se cancela el turno?",
      input: "text",
      inputLabel: "Comentario",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "¡Tiene que dejar un comentario!";
        }
        return null;
      }
    });
    if (comentarioAdmin) {
      const nuevoEstado = 'cancelado';

      // Cambiar el estado en Supabase
      this.db.cambiarEstadoTurnoComentario(turno.id, nuevoEstado, comentarioAdmin);

      // Cambiar visualmente sin refrescar desde base de datos
      turno.estado = nuevoEstado;
    }
  }
}
