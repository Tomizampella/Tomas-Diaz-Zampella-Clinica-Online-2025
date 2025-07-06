import 'chart.js/auto';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { QueryList, ViewChildren } from '@angular/core';
import { DatabaseService } from '../../services/database.service';

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

  // aquí guardaremos las 5 configs
  configs: Array<{
    type: ChartType;
    data: ChartConfiguration['data'];
    options?: ChartConfiguration['options'];
  }> = [];

  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    this.logsIngresos = await this.db.traerTodosLosLogsDeIngreso();
    this.turnos       = await this.db.traerTodosLosTurnos();
    this.mostrarGraficos();
  }

  mostrarGraficos() {
    this.configs = [];


   

    // — 1: turnos por día (line)
    {
      const byDay = new Map<string,number>();
      this.turnos.forEach(t=>{
        const d=new Date(t.fecha)
           .toLocaleDateString('es-AR',{day:'2-digit',month:'2-digit'});
        byDay.set(d,(byDay.get(d)||0)+1);
      });
      this.configs.push({
        type:'line',
        data:{
          labels:Array.from(byDay.keys()),
          datasets:[{label:'Turnos', data:Array.from(byDay.values()), borderColor:'#2ecc71', fill:false}]
        },
        options:{responsive:true, scales:{y:{beginAtZero:true}}}
      });
    }

    // — 2: solicitados por médico último mes (horizontal bar)
    {
      const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
      const byDoc=new Map<string,number>();
      this.turnos
        .filter(t=>new Date(t.fecha)>=cutoff)
        .forEach(t=>{
          const key=`${t.especialista.nombre} ${t.especialista.apellido}`;
          byDoc.set(key,(byDoc.get(key)||0)+1);
        });
      this.configs.push({
        type:'bar',
        data:{
          labels:Array.from(byDoc.keys()),
          datasets:[{label:'Solicitados',data:Array.from(byDoc.values()),backgroundColor:'#9b59b6'}]
        },
        options:{ indexAxis:'y', responsive:true, scales:{ x:{beginAtZero:true} } }
      });
    }

    // — 3: finalizados por médico último mes (horizontal bar)
    {
      const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-30);
      const byDoc=new Map<string,number>();
      this.turnos
        .filter(t=>t.estado==='realizado'&&new Date(t.fecha)>=cutoff)
        .forEach(t=>{
          const key=`${t.especialista.nombre} ${t.especialista.apellido}`;
          byDoc.set(key,(byDoc.get(key)||0)+1);
        });
      this.configs.push({
        type:'bar',
        data:{
          labels:Array.from(byDoc.keys()),
          datasets:[{label:'Finalizados',data:Array.from(byDoc.values()),backgroundColor:'#2ecc71'}]
        },
        options:{ indexAxis:'y', responsive:true, scales:{ x:{beginAtZero:true} } }
      });
    }

     // — 4: turnos por especialidad (pie)
    {
      const m: Record<string,number> = {};
      this.turnos.forEach(t => m[t.especialidad]= (m[t.especialidad]||0)+1 );
      this.configs.push({
        type:'pie',
        data:{
          labels: Object.keys(m),
          datasets:[{ data:Object.values(m),
            backgroundColor:['#e74c3c','#f1c40f','#2ecc71','#9b59b6', '#3498db', '#e67e22', '#1abc9c'] }]
        },
        options:{responsive:true}
      });
    }

    // finalmente inyectamos cada config en su canvas
    setTimeout(() => {
      this.charts.forEach((c,i) => {
        const cfg = this.configs[i];
        Object.assign(c.chart!.config,{ type:cfg.type, data:cfg.data, options:cfg.options });
        c.update();
      });
    });
  }

  trackById(index: number, item: any) {
    return item.id;
  }
}