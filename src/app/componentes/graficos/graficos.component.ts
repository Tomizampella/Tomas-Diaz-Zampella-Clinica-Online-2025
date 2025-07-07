import 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { QueryList, ViewChildren } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver'; // si corre en navegador
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { variable64 } from "../mi-perfil/imagen-base64";

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-graficos',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.css'
})
export class GraficosComponent {
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  logsIngresos: any[] = [];
  turnos: any[] = [];

  
  configs: Array<{
    type: ChartType;
    data: ChartConfiguration['data'];
    options?: ChartConfiguration['options'];
  }> = [];

  constructor(private db: DatabaseService) { }

  async ngOnInit() {
    this.logsIngresos = await this.db.traerTodosLosLogsDeIngreso();
    this.turnos = await this.db.traerTodosLosTurnos();
    this.mostrarGraficos();
  }

  mostrarGraficos() {
    this.configs = [];

    
    {
      const byDay = new Map<string, number>();
      this.turnos.forEach(t => {
        const d = new Date(t.fecha)
          .toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        byDay.set(d, (byDay.get(d) || 0) + 1);
      });
      this.configs.push({
        type: 'line',
        data: {
          labels: Array.from(byDay.keys()),
          datasets: [{ label: 'Turnos', data: Array.from(byDay.values()), borderColor: '#e74c3c', fill: false }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
      });
    }

    
    {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      const byDoc = new Map<string, number>();
      this.turnos
        .filter(t => new Date(t.fecha) >= cutoff)
        .forEach(t => {
          const key = `${t.especialista.nombre} ${t.especialista.apellido}`;
          byDoc.set(key, (byDoc.get(key) || 0) + 1);
        });
      this.configs.push({
        type: 'bar',
        data: {
          labels: Array.from(byDoc.keys()),
          datasets: [{ label: 'Solicitados', data: Array.from(byDoc.values()), backgroundColor: '#9b59b6' }]
        },
        options: { indexAxis: 'y', responsive: true, scales: { x: { beginAtZero: true } } }
      });
    }

    
    {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      const byDoc = new Map<string, number>();
      this.turnos
        .filter(t => t.estado === 'realizado' && new Date(t.fecha) >= cutoff)
        .forEach(t => {
          const key = `${t.especialista.nombre} ${t.especialista.apellido}`;
          byDoc.set(key, (byDoc.get(key) || 0) + 1);
        });
      this.configs.push({
        type: 'bar',
        data: {
          labels: Array.from(byDoc.keys()),
          datasets: [{ label: 'Finalizados', data: Array.from(byDoc.values()), backgroundColor: '#2ecc71' }]
        },
        options: { indexAxis: 'y', responsive: true, scales: { x: { beginAtZero: true } } }
      });
    }

   
    {
      const m: Record<string, number> = {};
      this.turnos.forEach(t => m[t.especialidad] = (m[t.especialidad] || 0) + 1);
      this.configs.push({
        type: 'pie',
        data: {
          labels: Object.keys(m),
          datasets: [{
            data: Object.values(m),
            backgroundColor: ['#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#3498db', '#e67e22', '#1abc9c']
          }]
        },
        options: { responsive: true }
      });
    }

    
    setTimeout(() => {
      this.charts.forEach((c, i) => {
        const cfg = this.configs[i];
        Object.assign(c.chart!.config, { type: cfg.type, data: cfg.data, options: cfg.options });
        c.update();
      });
    });
  }


async descargarExcelEstadisticas(): Promise<void> {

  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${dd}-${mm}-${yyyy}_${hh}-${mi}-${ss}`;
};


  const wb = new ExcelJS.Workbook();


  const wsLogs = wb.addWorksheet('LogsIngresos');
  wsLogs.addRow(['Fecha', 'Nombre', 'Apellido', 'Rol']);
  this.logsIngresos.forEach(l =>
    wsLogs.addRow([
      this.formatearFechaHora(l.fecha_ingreso),
      l.usuario_nombre,
      l.usuario_apellido,
      l.usuario_rol
    ])
  );
  wsLogs.columns.forEach(c => (c.width = 25));


  const canvasToJpeg = (source: HTMLCanvasElement): string => {
    const c = document.createElement('canvas');
    c.width  = source.width;
    c.height = source.height;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';      // fondo blanco
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(source, 0, 0);
    return c.toDataURL('image/jpeg', 0.92);   // calidad de la imagen
  };

 
  const addCanvasToSheet = (
    canvas: HTMLCanvasElement,
    title : string,
    extW  : number,
    extH  : number
  ) => {
    const ws   = wb.addWorksheet(title);
    const data = canvasToJpeg(canvas);                      
    const id   = wb.addImage({ base64: data, extension: 'jpeg' });
    ws.addImage(id, { tl: { col: 0, row: 0 }, ext: { width: extW, height: extH } });
  };


  const cvs = this.charts.map(c => c.chart?.canvas).filter(Boolean) as HTMLCanvasElement[];

  
  if (cvs[0]) addCanvasToSheet(cvs[0], 'TurnosPorDía',        350, 175);
  
  if (cvs[1]) addCanvasToSheet(cvs[1], 'SolicitadosÚltMes',   350, 175);
  
  if (cvs[2]) addCanvasToSheet(cvs[2], 'FinalizadosÚltMes',   350, 175);
  
  if (cvs[3]) addCanvasToSheet(cvs[3], 'PorEspecialidad',     350, 350);


  const buffer = await wb.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: 'application/octet-stream' }),
    `estadisticas_y_graficos_${timestamp()}.xlsx`
  );
}

generarPdf() {
  const pad = (n: number) => String(n).padStart(2, '0');
  const timestamp = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${dd}-${mm}-${yyyy}_${hh}-${mi}-${ss}`;
};
const tableBody = [
    [
      { text: "Fecha", style: "tableHeader" },
      { text: "Nombre", style: "tableHeader" },
      { text: "Apellido", style: "tableHeader" },
      { text: "Rol", style: "tableHeader" },
    ],
    ...this.logsIngresos.map((log) => [
      this.formatearFechaHora(log.fecha_ingreso),
      log.usuario_nombre,
      log.usuario_apellido,
      log.usuario_rol
    ]),
  ];
  
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
  contenido.push({ text: 'Estadísticas y gráficos', style: 'titulo', margin: [0, 10, 0, 10] });
  contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] });


  contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] });

  contenido.push({
    text: 'Logs de ingreso al sistema',
    style: 'titulo',
    margin: [0, 20, 0, 10],
  });

  //Tabla
  contenido.push({
    table: {
      headerRows: 1,
      widths: ["*", "*", "*", "*"],
      body: tableBody,
    },
    layout: "lightHorizontalLines",
    margin: [0, 10, 0, 10],
  });

  contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] });
  
  //Graficos
   
  const canvasToJpeg = (source: HTMLCanvasElement): string => {
    const c = document.createElement('canvas');
    c.width = source.width;
    c.height = source.height;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(source, 0, 0);
    return c.toDataURL('image/jpeg', 0.92);
  };

  const cvs = this.charts.map(c => c.chart?.canvas).filter(Boolean) as HTMLCanvasElement[];

  const titulos = ['Cantidad de turnos por día', 'Solicitados por médico último mes', 'Finalizados por médico último mes', 'Cantidad de turnos por especialidad'];

 cvs.forEach((canvas, i) => {
  contenido.push({
    text: titulos[i],
    style: 'titulo',
    margin: [0, 20, 0, 10],
    ...(i === 0 || i === 2 ? { pageBreak: 'before' } : {}) 
  });
  contenido.push({
    image: canvasToJpeg(canvas),
    width: i === 3 ? 300 : 500,
    alignment: 'center',
    margin: [0, 0, 0, 20]
  });

  if(i === 0 || i === 2){
    contenido.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] });
  }
});


  const docDefinition: any = {
    content: contenido,
    styles: {
      titulo: {
        fontSize: 18,
        bold: true,
        alignment: 'center'
      },
      tableHeader: {
      bold: true,
      fontSize: 12,
      color: "black",
    }
    },
    defaultStyle: {
      fontSize: 12
    },
    images: {
      logo: variable64.miVar // logo de la empresa
    },
    pageMargins: [40, 60, 40, 40]
  };

  pdfMake.createPdf(docDefinition).download(`estadisticas_y_graficos_${timestamp()}.pdf`);
}




  formatearFechaHora(fechaIso: string): string {
  const fecha = new Date(fechaIso);

  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();

  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');

  return `${dia}-${mes}-${anio} ${horas}:${minutos}:${segundos}`;
}

  trackById(index: number, item: any) {
    return item.id;
  }
}