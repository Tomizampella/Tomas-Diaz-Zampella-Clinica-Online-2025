import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export default class MisTurnosComponent {
  db = inject(DatabaseService);
  turnos: any[] = [];
  searchTerm: string = '';
  auth = inject(AuthService);
  rolUsuario: string = '';
  columnaBusqueda: string = '';

  constructor() {
    this.rolUsuario = this.auth.rolUsuario;
    if (this.rolUsuario === 'paciente') {
      this.columnaBusqueda = 'paciente_id';
    } else {
      this.columnaBusqueda = 'especialista_id';
    }
  }

  ngOnInit() {
    this.obtenerTurnos();
  }

  async obtenerTurnos() {
    this.turnos = await this.db.traerTodosLosTurnosPorRol(this.columnaBusqueda, this.auth.idUsuario);
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

  verResena(turno: any) {
    Swal.fire({
      title: turno.comentario,
    });
  }

  hacerEncuesta(turno: any) {
  Swal.fire({
    title: 'Encuesta de atención',
    html: `
      <label for="atencion">Atención del especialista:</label>
      <select id="atencion" class="swal2-select" required>
        <option value="" disabled selected>Seleccione</option>
        <option value="mala">Mala</option>
        <option value="buena">Buena</option>
        <option value="excelente">Excelente</option>
      </select><br><br>

      <label for="recomienda">¿Recomienda este consultorio?</label>
      <select id="recomienda" class="swal2-select" required>
        <option value="" disabled selected>Seleccione</option>
        <option value="si">Sí</option>
        <option value="no">No</option>
      </select><br><br>

      <label for="higiene">Higiene del consultorio:</label>
      <select id="higiene" class="swal2-select" required>
        <option value="" disabled selected>Seleccione</option>
        <option value="sucio">Sucio</option>
        <option value="normal">Normal</option>
        <option value="limpio">Limpio</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar encuesta',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const atencion = (document.getElementById('atencion') as HTMLSelectElement).value;
      const recomienda = (document.getElementById('recomienda') as HTMLSelectElement).value;
      const higiene = (document.getElementById('higiene') as HTMLSelectElement).value;

      if (!atencion || !recomienda || !higiene) {
        Swal.showValidationMessage('Por favor, complete todos los campos');
        return;
      }

      return { atencion, recomienda, higiene };
    }
  }).then(async (result) => {
    if (result.isConfirmed && result.value) {
      const { atencion, recomienda, higiene } = result.value;

      console.log('Datos de la encuesta:', {
        turno_id: turno.id,
        atencion,
        recomienda,
        higiene_consultorio: higiene
      });

      const guardado = await this.db.guardarEncuesta(turno.id, atencion, recomienda, higiene);
      if(guardado){
        this.db.cambiarEstadoEncuesta(turno.id)
      }
    }
  });
}
}
