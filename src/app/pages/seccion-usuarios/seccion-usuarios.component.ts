import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../../componentes/header/header.component";
import { FooterComponent } from "../../componentes/footer/footer.component";
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seccion-usuarios',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css'
})
export class SeccionUsuariosComponent implements OnInit {
  mostrarTexto: boolean = true;
  constructor (private router: Router){}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Mostramos el texto solo si estamos exactamente en /seccion-usuarios
        this.mostrarTexto = event.urlAfterRedirects === '/seccion-usuarios';
      });
  }

}
