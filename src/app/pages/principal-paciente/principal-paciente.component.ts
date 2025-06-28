import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { HeaderComponent } from '../../componentes/header/header.component';

@Component({
  selector: 'app-principal-paciente',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './principal-paciente.component.html',
  styleUrl: './principal-paciente.component.css'
})
export class PrincipalPacienteComponent {
  mostrarTexto: boolean = true;
  constructor (private router: Router){}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Mostramos el texto solo si estamos exactamente en /seccion-usuarios
        this.mostrarTexto = event.urlAfterRedirects === '/paciente';
      });
  }

}
