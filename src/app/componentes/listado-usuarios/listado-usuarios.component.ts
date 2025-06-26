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
export default class ListadoUsuariosComponent {
db = inject(DatabaseService);
estadisticasPorRol: { [rol: string]: any[] } = {};
rolSeleccionado: string | null = null;

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

  descargarExcel() {
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
