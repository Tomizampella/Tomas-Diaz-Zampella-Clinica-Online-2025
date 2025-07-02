import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  selector: 'app-mis-turnos',
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos.component.html',
  styleUrl: './mis-turnos.component.css'
})
export class MisTurnosComponent {
  db = inject(DatabaseService);
  turnos: any[] = [];
  searchTerm: string = '';
  auth = inject(AuthService);
  rolUsuario: string = '';
  idUsuario: string = '';
  columnaBusqueda: string = '';
  canalTurnos: RealtimeChannel | null = null;

  constructor() {
    this.rolUsuario = this.auth.rolUsuario;
    this.idUsuario = this.auth.idUsuario;
    if (this.rolUsuario === 'paciente') {
      this.columnaBusqueda = 'paciente_id';
    } else {
      this.columnaBusqueda = 'especialista_id';
    }
  }

  ngOnInit() {
    this.obtenerTurnos();
    if (this.rolUsuario !== '' && this.idUsuario !== '') {
      this.escucharTablaTurnos();
    }
  }

  ngOnDestroy() {
    this.canalTurnos?.unsubscribe();
  }

  async obtenerTurnos() {
    this.turnos = await this.db.traerTodosLosTurnosPorRol(this.columnaBusqueda, this.auth.idUsuario);
    console.log('Turnos: ', this.turnos);
  }

  escucharTablaTurnos() {
    this.canalTurnos = this.auth.sb.supabase
      .channel('canal-turnos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'turnos',
          filter: `${this.columnaBusqueda}=eq.${this.idUsuario}`,
        },
        async (cambios: any) => {
          console.log('Evento recibido:', cambios);
          const id_turno_valor_nuevo = cambios.new['id'];
          let rol_a_buscar = '';
          let id_a_buscar = '';
          if (this.rolUsuario === 'paciente') {
            rol_a_buscar = 'especialista';
            id_a_buscar = cambios.new['especialista_id'];
          } else {
            rol_a_buscar = 'paciente';
            id_a_buscar = cambios.new['paciente_id'];
          }

          const resultado = await this.db.traerNombreApellido(id_a_buscar);
          if (resultado) {
            cambios.new[rol_a_buscar] = {
              nombre: resultado.nombre,
              apellido: resultado.apellido
            };
          }



          const index = this.turnos.findIndex(t => t.id === id_turno_valor_nuevo);
          if (index !== -1) {
            this.turnos[index] = cambios.new;
          }
        }
      )
      .subscribe();
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

      if (this.rolUsuario === 'paciente') {
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
      } else if (this.rolUsuario === 'especialista') {
        // nombre del paciente
        const nom = item.paciente?.nombre?.toLowerCase() ?? '';
        if (nom.includes(term)) {
          return true;
        }
        // apellido del paciente
        const ape = item.paciente?.apellido?.toLowerCase() ?? '';
        if (ape.includes(term)) {
          return true;
        }
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

  async cancelarRechazarTurno(turno: any, nuevoEstado: string) {
    let mensaje = '';
    if (nuevoEstado === 'cancelado') {
      mensaje = 'cancela';
    } else if (nuevoEstado === 'rechazado') {
      mensaje = 'rechaza';
    }
    const { value: comentarioCancelacion } = await Swal.fire({
      title: `¿Por qué se ${mensaje} el turno?`,
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
    if (comentarioCancelacion) {

      // Cambiar el estado en Supabase
      this.db.cambiarEstadoTurnoComentario(turno.id, nuevoEstado, comentarioCancelacion);

      // Cambiar visualmente sin refrescar desde base de datos
      turno.estado = nuevoEstado;
    }
  }

  aceptarTurno(turno: any) {
    this.db.cambiarEstadoTurno(turno.id, 'aceptado');
  }

  verResena(turno: any) {
    Swal.fire({
      title: turno.comentario,
    });
  }

  async finalizarTurno(turno: any) {
    const { value: comentarioAdmin } = await Swal.fire({
      title: "Deje un comentario o diagnóstico realizado.",
      input: "text",
      inputLabel: "Comentario o diagnóstico realizado",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "¡Tiene que dejar un comentario!";
        }
        return null;
      }
    });
    if (comentarioAdmin) {
      const nuevoEstado = 'realizado';

      // Cambiar el estado en Supabase
      this.db.cambiarEstadoTurnoComentario(turno.id, nuevoEstado, comentarioAdmin);

    }
  }

  hacerEncuesta(turno: any) {
    Swal.fire({
      title: 'Encuesta',
      html: `
      <label for="atencion">Calidad de la atención general:</label>
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
        if (guardado) {
          this.db.cambiarEstadoEncuesta(turno.id)
        }
      }
    });
  }

  async calificarAtencion(turno: any) {
    const { value: calificacion } = await Swal.fire({
      title: `¿Cómo califíca la atención del Dr.${turno.especialista.nombre} ${turno.especialista.apellido}?`,
      input: "text",
      inputLabel: "Deje un comentario",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "¡Tiene que dejar un comentario!";
        }
        return null;
      }
    });
    if (calificacion) {


      // Cambiar el estado en Supabase
      this.db.guardarCalificacionAtencion(turno.id, calificacion);
    }
  }
}
