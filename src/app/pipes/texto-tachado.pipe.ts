import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textoTachado'
})
export class TextoTachadoPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    if(value === 'cancelado'){
      return `<s>${value}</s>`
    }
    return value;
  }

}
