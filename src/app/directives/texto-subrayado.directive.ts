import { Directive, ElementRef, HostListener, inject} from '@angular/core';

@Directive({
  selector: '[appTextoSubrayado]'
})
export class TextoSubrayadoDirective {
  element = inject(ElementRef);
  private estaSubrayado = false;

  @HostListener('click') onClick() {
    this.estaSubrayado = !this.estaSubrayado;
    this.element.nativeElement.style.textDecoration = this.estaSubrayado ? 'underline' : 'none';
  }
}
