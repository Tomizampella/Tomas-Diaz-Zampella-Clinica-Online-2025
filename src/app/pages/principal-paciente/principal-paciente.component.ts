import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ChildrenOutletContexts, Data, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { HeaderComponent } from '../../componentes/header/header.component';
import { slideInDerIzqAnimation } from '../../slideInDerIzqAnimation';

@Component({
  selector: 'app-principal-paciente',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './principal-paciente.component.html',
  styleUrl: './principal-paciente.component.css',
  animations: [slideInDerIzqAnimation]
})
export class PrincipalPacienteComponent {
  mostrarTexto: boolean = true;
  constructor (private router: Router){}

  contexts = inject(ChildrenOutletContexts);

  getRouteAnimationData(): Data | undefined {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        
        this.mostrarTexto = event.urlAfterRedirects === '/paciente';
      });
  }

}
