import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-graficos',
  imports: [CommonModule],
  templateUrl: './graficos.component.html',
  styleUrl: './graficos.component.css'
})
export class GraficosComponent {
  logsIngresos : any[] = [];

  trackById(index: number, item: any) {
  return item.id;
  }


}
