import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-listado-usuarios',
  imports: [],
  templateUrl: './listado-usuarios.component.html',
  styleUrl: './listado-usuarios.component.css'
})
export class ListadoUsuariosComponent {
db = inject(DatabaseService);
estadisticasPorRol: { [rol: string]: any[] } = {};
rolSeleccionado: string | null = null;
turnos: any[] = [];
async ngOnInit() {
    const data = await this.db.traerTodosLosUsuarios();
    this.estadisticasPorRol = this.agruparPorRol(data);
  }

agruparPorRol(usuarios: any[]): { [rol: string]: any[] } {
  const agrupado: { [rol: string]: any[] } = {};

  usuarios.forEach(p => {
    if (!agrupado[p.rol]) {
      agrupado[p.rol] = [];
    }
    agrupado[p.rol].push(p);
  });

  // Agrego todos los usuarios en un array sin agrupar
  agrupado['todos'] = usuarios;

  return agrupado;
}

  cargarTabla(rol: string) {
    this.rolSeleccionado = rol;
  }



  async descargarExcelPorPaciente(paciente: any) {
  this.turnos = await this.db.traerTurnosRealizadosPorRol('paciente_id', paciente.id);
  console.log('turnos desde la funcion descargarExcelPorPaciente: ', this.turnos);

  if (this.turnos && this.turnos.length > 0) {
    const datosFormateados = this.turnos.map(item => ({
      Fecha: this.formatearFecha(item.fecha),
      Horario: this.formatHorario(item.hora),
      Nombre_especialista: item.especialista?.nombre,
      Apellido_especialista: item.especialista?.apellido,
      Especialidad: item.especialidad
    }));

    const nombreApellidoSheet = `${paciente.nombre}_${paciente.apellido}`;
    const nombreSheet = `Listado de turnos de ${nombreApellidoSheet}`;

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosFormateados);
    const workbook: XLSX.WorkBook = {
      Sheets: { [nombreSheet]: worksheet },
      SheetNames: [nombreSheet]
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, `listado_de_turnos_${nombreApellidoSheet}.xlsx`);
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

  descargarExcelTodos() {
  const data = this.estadisticasPorRol['todos'];

  // Mapear los datos solo con las propiedades que querés exportar
  const datosFormateados = data.map(item => ({
    Nombre: item.nombre,
    Apellido: item.apellido,
    Dni: item.dni,
    Edad: item.edad,
    Correo: item.email,
    Rol: item.rol
  }));

  // Crear una hoja de cálculo a partir del array
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosFormateados);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Listado de Usuarios': worksheet },
    SheetNames: ['Listado de Usuarios']
  };

  // Generar el buffer
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Guardar como archivo usando FileSaver
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  FileSaver.saveAs(blob, 'listado_usuarios.xlsx');
}

}
