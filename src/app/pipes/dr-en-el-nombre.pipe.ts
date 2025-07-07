import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'drEnElNombre'
})
export class DrEnElNombrePipe implements PipeTransform {

  transform(value: string, rol:string): string {
    if(rol === 'especialista'){
      return `Dr. ${value}`
    }
    return value;
  }

}
