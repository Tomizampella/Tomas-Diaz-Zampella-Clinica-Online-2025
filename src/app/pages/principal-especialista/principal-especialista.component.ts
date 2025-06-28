import { Component } from '@angular/core';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-principal-especialista',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './principal-especialista.component.html',
  styleUrl: './principal-especialista.component.css'
})
export class PrincipalEspecialistaComponent {
  mostrarTexto: boolean = true;
  constructor (private router: Router){}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Mostramos el texto solo si estamos exactamente en /seccion-usuarios
        this.mostrarTexto = event.urlAfterRedirects === '/especialista';
      });
  }

}