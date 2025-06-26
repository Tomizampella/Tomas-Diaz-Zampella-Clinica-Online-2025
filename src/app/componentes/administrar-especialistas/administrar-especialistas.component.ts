import { Component, inject, signal } from '@angular/core';
import { DatabaseService } from '../../services/database.service';
import { SupabaseService } from '../../services/supabase.service';
import { RealtimeChannel } from '@supabase/supabase-js';

@Component({
  selector: 'app-administrar-especialistas',
  imports: [],
  templateUrl: './administrar-especialistas.component.html',
  styleUrl: './administrar-especialistas.component.css'
})
export default class AdministrarEspecialistasComponent {
db = inject(DatabaseService);
sb = inject(SupabaseService);
especialistas = signal<any>([]);
canalEspecialistas: RealtimeChannel | null = null;

constructor() {
  this.db.traerTodosLosEspecialistas().then((data) => {
    this.especialistas.set([...data]);
  });
}

ngOnInit() {
  // schema-db-changes -> schema public
  // table-db-changes -> tabla mensajes
  this.canalEspecialistas = this.sb.supabase.channel('table-db-changes');
  this.canalEspecialistas.on(
    'postgres_changes',
    {
      // event: * (todos), INSERT, UPDATE, DELETE
      event: '*',
      schema: 'public',
      table: 'usuarios_clinica',
      filter:'rol=eq.especialista'
    },
    async (cambios: any) => {
      console.log(cambios);
      
      this.especialistas.update((valor_anterior) => {
        valor_anterior.push(cambios.new);
        return valor_anterior;
      });
    }
  );
  this.canalEspecialistas.subscribe();
}

cambiarEstadoAprobacion(id_usuario:string, cambio:boolean = false){
this.db.cambiarEstadoEspecialista(id_usuario,cambio);
}

ngOnDestroy() {
    this.canalEspecialistas?.unsubscribe();
    console.log('Canal de especialistas cerrado');
  }

}
