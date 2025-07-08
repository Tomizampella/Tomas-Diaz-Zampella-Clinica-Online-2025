import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "../../componentes/header/header.component";
import { FooterComponent } from "../../componentes/footer/footer.component";
import { ChildrenOutletContexts, Data, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { slideInAnimation } from '../../slideInAnimation';

@Component({
  selector: 'app-seccion-usuarios',
  imports: [HeaderComponent, FooterComponent, RouterOutlet, RouterLink, CommonModule],
  templateUrl: './seccion-usuarios.component.html',
  styleUrl: './seccion-usuarios.component.css',
  animations:[slideInAnimation]
})
export class SeccionUsuariosComponent implements OnInit {
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
        this.mostrarTexto = event.urlAfterRedirects === '/seccion-usuarios';
      });
  }

}
