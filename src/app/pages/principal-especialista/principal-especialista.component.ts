import { Component, inject } from '@angular/core';
import { HeaderComponent } from '../../componentes/header/header.component';
import { FooterComponent } from '../../componentes/footer/footer.component';
import { ChildrenOutletContexts, Data, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { slideInAnimation } from '../../slideInAnimation';

@Component({
  selector: 'app-principal-especialista',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './principal-especialista.component.html',
  styleUrl: './principal-especialista.component.css',
  animations:[slideInAnimation]
})
export class PrincipalEspecialistaComponent {
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
        
        this.mostrarTexto = event.urlAfterRedirects === '/especialista';
      });
  }

}