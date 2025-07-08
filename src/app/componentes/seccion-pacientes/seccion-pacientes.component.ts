import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seccion-pacientes',
  imports: [CommonModule,FormsModule],
  templateUrl: './seccion-pacientes.component.html',
  styleUrl: './seccion-pacientes.component.css'
})
export class SeccionPacientesComponent {
  db = inject(DatabaseService);
  auth = inject(AuthService);  
  rolUsuario: string = '';
  idUsuario: string = '';
  columnaBusqueda: string = '';
  turnos: any[] = [];
  pacientes: { id: string; nombre: string; apellido: string; foto_1:string}[] = [];
  turnosPorId: { [paciente_id: string]: any[] } = {};
  selectedPaciente: string = '';

  constructor(){
    this.idUsuario = this.auth.idUsuario;
    this.columnaBusqueda = 'especialista_id';
  }

  ngOnInit(){
    this.obtenerTurnos();
  }

  async obtenerTurnos() {
    this.turnos = await this.db.traerTurnosRealizadosPorRol(this.columnaBusqueda, this.auth.idUsuario);
    
    if(this.turnos){
      this.obtenerPacientes();
      this.turnosPorId = this.agruparPorId(this.turnos);
      
    }
  }

  agruparPorId(turnos: any[]): { [paciente_id: string]: any[] } {
  const agrupado: { [paciente_id: string]: any[] } = {};

  turnos.forEach(t => {
    if (!agrupado[t.paciente_id]) {
      agrupado[t.paciente_id] = [];
    }
    agrupado[t.paciente_id].push(t);
  });

  return agrupado;
}

async obtenerPacientes() {
  const pacientesMap = new Map<string, { id: string; nombre: string; apellido: string; foto_1:string}>();

  for (const turno of this.turnos) {
    const id = turno.paciente_id;
    const nombre = turno.paciente?.nombre;
    const apellido = turno.paciente?.apellido;
    const foto_1 = turno.paciente?.foto_1;

    if (id && nombre && apellido && foto_1 && !pacientesMap.has(id)) {
      pacientesMap.set(id, { id, nombre, apellido, foto_1});
    }
  }

  this.pacientes = Array.from(pacientesMap.values());
  
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

  trackById(index: number, item: any) {
  return item.id;
}

selectPaciente(id_paciente: string) {
    this.selectedPaciente = id_paciente;
  }


}
