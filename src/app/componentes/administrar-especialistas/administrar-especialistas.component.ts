import { Component, inject, signal } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { SupabaseService } from '../../services/supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-administrar-especialistas',
  imports: [CommonModule],
  templateUrl: './administrar-especialistas.component.html',
  styleUrl: './administrar-especialistas.component.css'
})
export class AdministrarEspecialistasComponent {
db = inject(DatabaseService);
sb = inject(SupabaseService);
especialistas: any[] = [];


ngOnInit() {
  this.obtenerEspecialistas();
}

cambiarEstadoAprobacion(especialista: any) {
  const nuevoEstado = !especialista.aprobacion_admin;

  // Cambiar el estado en Supabase
  this.db.cambiarEstadoEspecialista(especialista.id, nuevoEstado);

  // Cambiar visualmente sin refrescar desde base de datos
  especialista.aprobacion_admin = nuevoEstado;
}


async obtenerEspecialistas(){
this.especialistas  = await this.db.traerTodosLosEspecialistas();
}

}
