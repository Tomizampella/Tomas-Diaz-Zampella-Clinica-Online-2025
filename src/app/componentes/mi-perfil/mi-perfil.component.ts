import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { variable64 } from "./imagen-base64";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


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
export class MiPerfilComponent {
  db = inject(DatabaseService);
  auth = inject(AuthService);
  objUsuario: any = null;
  modo: 'perfil' | 'horarios' | 'historia_clinica' = 'perfil';
  correoUsuario: string = '';
  rolUsuario: string = '';
  idUsuario: string = '';
  turnos: any[] = [];

  especialistas: { id: string; nombre: string; apellido: string }[] = [];
  turnosPorId: { [especialista_id: string]: any[] } = {};

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
  mostrarPerfil() { this.modo = 'perfil'; }
  mostrarHistoriaClinica() { this.modo = 'historia_clinica'; }

  constructor() {
    this.correoUsuario = this.auth.correoUsuario;
    this.rolUsuario = this.auth.rolUsuario;
    this.idUsuario = this.auth.idUsuario;
  }

  async ngOnInit() {
    
    this.objUsuario = await this.db.traerUsuario(this.correoUsuario);
    if (this.rolUsuario === 'paciente') {
      this.obtenerTurnos();
    }
  }

  agruparPorId(turnos: any[]): { [especialista_id: string]: any[] } {
  const agrupado: { [especialista_id: string]: any[] } = {};

  turnos.forEach(t => {
    if (!agrupado[t.especialista_id]) {
      agrupado[t.especialista_id] = [];
    }
    agrupado[t.especialista_id].push(t);
  });

  // Agrego todos los turnos en un array sin agrupar
  agrupado['todos'] = turnos;

  return agrupado;
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

  //Historia Clinica
  objectKeys = Object.keys;

  async obtenerTurnos() {
    this.turnos = await this.db.traerTurnosRealizadosPorRol('paciente_id', this.auth.idUsuario);
    this.turnos = this.turnos.map(t => {
      try {
        t.datos_consulta_parseado = typeof t.datos_consulta === 'string'
          ? JSON.parse(t.datos_consulta)
          : t.datos_consulta;
      } catch (e) {
        t.datos_consulta_parseado = null;
      }
      return t;
    });

    if(this.turnos){
      this.obtenerEspecialistas();
      this.turnosPorId = this.agruparPorId(this.turnos);
    }
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

    return `<p><strong>Comentario:</strong> <br>${turno.comentario}</p><hr>${html}`;
  }

  generarPdf(filtro: string, nombre_especialista:string='', apellido_especialista:string='') {
  let tituloPDF = '';
  if(filtro === 'todos'){
    tituloPDF = filtro;
  }else{
    tituloPDF = `solo_dr_${nombre_especialista}_${apellido_especialista}`;
  }
  const turnos = this.turnosPorId[filtro];
  const paciente = this.objUsuario;
  const fechaEmision = new Date().toLocaleString();

  const contenido: any[] = [];

  // Header
  contenido.push({
    columns: [
      { image: 'logo', width: 100, alignment: 'center' },
      { text: `Emitido: ${fechaEmision}`, alignment: 'right', margin: [0, 20, 10, 0], fontSize: 10 }
    ]
  });
  contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] });

  // Título
  contenido.push({ text: 'Historia Clínica', style: 'titulo', margin: [0, 10, 0, 10] });
  contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] });

  // Datos del paciente (dividido en columnas)
  contenido.push({
    columns: [
      { alignment: 'left' ,fontSize: 10, text: [{text: 'Paciente: ', bold: true, fontSize: 13}, `${paciente.nombre} ${paciente.apellido}`] },
      { alignment: 'center' ,fontSize: 10, text: [{text: 'DNI: ', bold: true, fontSize: 13}, `${paciente.dni}`] },
      { alignment: 'center' ,fontSize: 10, text: [{text: 'Edad: ', bold: true, fontSize: 13}, `${paciente.edad}`] },
      { alignment: 'right' ,fontSize: 10, text: [{text: 'Obra social: ', bold: true,fontSize: 13}, `${paciente.obra_social}`] }
    ],
    margin: [0, 10, 0, 10]
  });

  contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] });

  // Turnos
  for (const item of turnos) {
    const datos = item.datos_consulta_parseado ?? {};
    const especialista = item.especialista ?? {};

    contenido.push({
      text: `${this.formatearFecha(item.fecha)} - ${this.formatHorario(item.hora)}`,
      bold: true,
      margin: [0, 50, 0, 10]
    });

    contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }] });

    // Especialidad y Especialista (izquierda y derecha)
    contenido.push({
      columns: [
        { alignment: 'left', fontSize: 11,text: [{text: 'Especialidad: ', bold: true, fontSize: 13}, `${item.especialidad}`] },
        { alignment: 'right', fontSize: 11, text: [{text: 'Especialista: ', bold: true, fontSize: 13}, `${especialista.nombre ?? '-'} ${especialista.apellido ?? '-'}`] }
      ],
      margin: [0, 7, 0, 7]
    });

    contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }] });

    // Diagnóstico
    contenido.push({
      columns: [
        { alignment: 'left', fontSize: 11, italics: true, text: [{text: 'Diagnóstico: ', bold: true, fontSize: 13}, `${item.comentario}`] },
      ],
      margin: [0, 7, 0, 7]
    });

    contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }] });

    // Datos fijos (Altura, Peso, etc) como columnas
    contenido.push({
      columns: [
        { alignment: 'left',fontSize: 10,text: [{text: 'Altura: ', bold: true, fontSize: 13}, `${datos.altura ?? '-'}m`] },
        { alignment: 'center',fontSize: 10,text: [{text: 'Peso: ', bold: true, fontSize: 13}, `${datos.peso ?? '-'}kg`] },
        { alignment: 'center',fontSize: 10,text: [{text: 'Temperatura: ', bold: true, fontSize: 13}, `${datos.temperatura ?? '-'}°C`] },
        { alignment: 'right',fontSize: 10,text: [{text: 'Presión: ', bold: true, fontSize: 13}, `${datos.presion ?? '-'}`] },
      ],
      margin: [0, 7, 0, 7]
    });
    
    contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5 }] });
    // Extras
    if (datos.extras && typeof datos.extras === 'object') {
      const extras = Object.entries(datos.extras)
        .map(([clave, valor]) => `   ${clave}: ${valor}   `)
        .join('       ');
      contenido.push({
      columns: [
        { alignment: 'left', fontSize: 11, text: [{text: 'Datos adicionales: ', bold: true, fontSize: 13}, `${extras}`] },
      ],
      margin: [0, 7, 0, 7]
    });
    }

    contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.2 }] });
  }

  const docDefinition: any = {
    content: contenido,
    styles: {
      titulo: {
        fontSize: 18,
        bold: true,
        alignment: 'center'
      }
    },
    defaultStyle: {
      fontSize: 12
    },
    images: {
      logo: variable64.miVar // reemplazar con tu logo en base64
    },
    pageMargins: [40, 60, 40, 40]
  };

  pdfMake.createPdf(docDefinition).download(`historia_clinica_${tituloPDF}.pdf`);
}


  async obtenerEspecialistas() {
  const especialistasMap = new Map<string, { id: string; nombre: string; apellido: string }>();

  for (const turno of this.turnos) {
    const id = turno.especialista_id;
    const nombre = turno.especialista?.nombre;
    const apellido = turno.especialista?.apellido;

    if (id && nombre && apellido && !especialistasMap.has(id)) {
      especialistasMap.set(id, { id, nombre, apellido });
    }
  }

  this.especialistas = Array.from(especialistasMap.values());
  console.log('especialistas', this.especialistas);
}



}
