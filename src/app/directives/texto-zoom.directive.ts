import { Directive, ElementRef, HostListener, inject} from '@angular/core';

@Directive({
  selector: '[appTextoZoom]'
})
export class TextoZoomDirective {
  element = inject(ElementRef);

  @HostListener('mouseenter') onMouseEnter() {
    this.element.nativeElement.style.transform = 'scale(1.1)';
    this.element.nativeElement.style.transition = 'transform 0.3s';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.element.nativeElement.style.transform = 'scale(1)';
  }

  constructor() { }
}
