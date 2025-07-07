import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fechaConDia'
})
export class FechaConDiaPipe implements PipeTransform {
  diaSemana = ['Domingo','Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  transform(value: string, ...args: unknown[]): string {
    
  const fecha = new Date(value);
  const diaIndice = fecha.getUTCDay();
  const diaDigitos = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  const segundos = String(fecha.getSeconds()).padStart(2, '0');

  return `${this.diaSemana[diaIndice]} ${diaDigitos}-${mes}-${anio} ${horas}:${minutos}:${segundos}`;
  }

}
