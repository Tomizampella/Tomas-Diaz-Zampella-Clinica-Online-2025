import { Directive, ElementRef, HostListener, inject} from '@angular/core';


@Directive({
  selector: '[appTextoCursiva]'
})
export class TextoCursivaDirective {
  element: ElementRef<HTMLElement> = inject(ElementRef);
  @HostListener('mouseenter') enter(){
    this.cambiarTexto('italic');
  }

  @HostListener('mouseleave') leave(){
    this.cambiarTexto('');
  }

  cambiarTexto(tipoDeTexto:string){
    this.element.nativeElement.style.fontStyle = tipoDeTexto;
  }

  constructor() { }

}
