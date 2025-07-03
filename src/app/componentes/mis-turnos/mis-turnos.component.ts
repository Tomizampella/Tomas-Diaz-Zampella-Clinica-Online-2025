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
    // Buscar en especialidad
    if (item.especialidad.toLowerCase().includes(term)) return true;

    // Buscar en nombres según rol
    const nombre = this.rolUsuario === 'paciente'
      ? item.especialista?.nombre?.toLowerCase() ?? ''
      : item.paciente?.nombre?.toLowerCase() ?? '';
    const apellido = this.rolUsuario === 'paciente'
      ? item.especialista?.apellido?.toLowerCase() ?? ''
      : item.paciente?.apellido?.toLowerCase() ?? '';

    if (nombre.includes(term) || apellido.includes(term)) return true;

    // Buscar en datos_consulta
    let datos = item.datos_consulta;
    if (typeof datos === 'string') {
      try {
        datos = JSON.parse(datos);
      } catch (e) {
        console.error('Error al parsear datos_consulta:', e);
        return false;
      }
    }

    if (datos && typeof datos === 'object') {
      // Buscar en datos fijos
      for (const [clave, valor] of Object.entries(datos)) {
        if (clave !== 'extras') {
          if (
            clave.toLowerCase().includes(term) ||
            (typeof valor === 'string' && valor.toLowerCase().includes(term))
          ) {
            return true;
          }
        }
      }

      // Buscar en extras (si existen)
      if (datos.extras && typeof datos.extras === 'object') {
        for (const [claveExtra, valorExtra] of Object.entries(datos.extras)) {
          if (
            claveExtra.toLowerCase().includes(term) ||
            (typeof valorExtra === 'string' && valorExtra.toLowerCase().includes(term))
          ) {
            return true;
          }
        }
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
  const datos = turno.datos_consulta;

  // Parsear si viene como string JSON
  const parsed = typeof datos === 'string' ? JSON.parse(datos) : datos;

  // Armar HTML
  let html = '';
  for (const [clave, valor] of Object.entries(parsed ?? {})) {
    if (clave === 'extras' && valor && typeof valor === 'object') {
      html += `<hr><strong>Extras:</strong><br>`;
      for (const [extraClave, extraValor] of Object.entries(valor ?? {})) {
        html += `${extraClave}: ${extraValor}<br>`;
      }
    } else {
      html += `${clave.charAt(0).toUpperCase() + clave.slice(1)}: ${valor}<br>`;
    }
  }

  Swal.fire({
    title: 'Resumen del turno',
    html: `<p><strong>Comentario:</strong> <br>${turno.comentario}</p><hr>${html}`,
    confirmButtonText: 'Cerrar'
  });
} 

  async finalizarTurno(turno: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Finalizar turno',
      html: `
    <style>
      .swal2-html-container {
        max-height: 70vh;
        overflow-y: auto;
      }
      .swal2-input {
        padding: 0.4rem;
        font-size: 0.9rem;
      }
      .swal-row {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        width: 100%;
        flex-wrap: wrap;
        margin-top: 1rem;
      }
      .swal-row > div {
        flex: 1 1 200px;
        min-width: 0;
      }
    </style>
    <div>
      <div class="d-flex flex-column">
        <label>Comentario/Diagnóstico:</label>
        <input id="comentario" class="swal2-input" placeholder="Diagnóstico" />
      </div>
      <div class="swal-row">
        <!-- Datos obligatorios -->
        <div class="d-flex flex-column"><label>Altura (m):</label><input id="altura" class="swal2-input" placeholder="1.75"/></div>
        <div class="d-flex flex-column"><label>Peso (kg):</label><input id="peso" class="swal2-input" placeholder="70"/></div>
        <div class="d-flex flex-column"><label>Temperatura (°C):</label><input id="temperatura" class="swal2-input" placeholder="36.7"/></div>
        <div class="d-flex flex-column"><label>Presión:</label><input id="presion" class="swal2-input" placeholder="120"/></div>
      </div>
      <div class="swal-row">
        <!-- Extras -->
        <div class="d-flex flex-column"><label>Extra 1</label><input id="clave1" class="swal2-input" placeholder="Clave 1"/><input id="valor1" class="swal2-input" placeholder="Valor 1"/></div>
        <div class="d-flex flex-column"><label>Extra 2</label><input id="clave2" class="swal2-input" placeholder="Clave 2"/><input id="valor2" class="swal2-input" placeholder="Valor 2"/></div>
        <div class="d-flex flex-column"><label>Extra 3</label><input id="clave3" class="swal2-input" placeholder="Clave 3"/><input id="valor3" class="swal2-input" placeholder="Valor 3"/></div>
      </div>
    </div>
  `,
      width: '90%',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Finalizar',
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true,
      scrollbarPadding: false,
      preConfirm: () => {
        const comentario = (document.getElementById('comentario') as HTMLInputElement).value.trim();
        const altura = (document.getElementById('altura') as HTMLInputElement).value.trim();
        const peso = (document.getElementById('peso') as HTMLInputElement).value.trim();
        const temperatura = (document.getElementById('temperatura') as HTMLInputElement).value.trim();
        const presion = (document.getElementById('presion') as HTMLInputElement).value.trim();

        if (!comentario || !altura || !peso || !temperatura || !presion) {
          Swal.showValidationMessage('Debe completar el comentario y los 4 datos obligatorios');
          return;
        }

        // Recolectar claves y valores extras
        const extras: any = {};
        for (let i = 1; i <= 3; i++) {
          const clave = (document.getElementById(`clave${i}`) as HTMLInputElement).value.trim();
          const valor = (document.getElementById(`valor${i}`) as HTMLInputElement).value.trim();
          if (clave && valor) {
            extras[clave] = valor;
          } else if ((clave && !valor) || (!clave && valor)) {
            Swal.showValidationMessage(`Debe completar tanto clave como valor en el campo extra ${i}`);
            return;
          }
        }

        // Armar el JSON final
        const datosConsulta = {
          altura,
          peso,
          temperatura,
          presion,
          extras
        };

        return {
          comentario,
          datosConsulta
        };
      }
    });

    if (formValues) {
      const nuevoEstado = 'realizado';
      const comentario = formValues.comentario;
      const datosConsulta = JSON.stringify(formValues.datosConsulta);

      await this.db.finalizarTurnoConDatos(turno.id, nuevoEstado, comentario, datosConsulta);
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
