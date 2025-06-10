import { Injectable, inject} from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  sb = inject(SupabaseService);
  private BUCKET_NAME = 'fotosclinica';
  tablaUsuarios;
  constructor() {
    this.tablaUsuarios = this.sb.supabase.from("usuarios_clinica");
   }

   async agregarPaciente(email: string, nombre: string, apellido: string, edad: number, dni:string, 
    rol:string, obra_social:string, foto_1:string, foto_2:string,aprobacion_admin:boolean = true) 
    {
    const { data, error } = await this.tablaUsuarios.insert({ email, nombre, apellido, edad, dni, rol, obra_social, foto_1, foto_2, aprobacion_admin});
    if (error) {
      console.error('Error al agregar paciente a la base de datos:', error.message);
    }
    }

    async agregarEspecialista(email: string, nombre: string, apellido: string, edad: number, dni:string, 
    rol:string, especialidades:string[], foto_1:string,aprobacion_admin:boolean = false) 
    {
    const { data, error } = await this.tablaUsuarios.insert({ email, nombre, apellido, edad, dni, rol, especialidades, foto_1, aprobacion_admin});
    if (error) {
      console.error('Error al agregar especialista a la base de datos:', error.message);
    }
    }

    async agregarAdministrador(email: string, nombre: string, apellido: string, edad: number, dni:string, 
    rol:string, foto_1:string,aprobacion_admin:boolean = true) 
    {
    const { data, error } = await this.tablaUsuarios.insert({ email, nombre, apellido, edad, dni, rol,foto_1, aprobacion_admin});
    if (error) {
      console.error('Error al agregar administrador a la base de datos:', error.message);
    }
    }
    

    //subo la foto al supabase storage
   async guardarFoto(archivo: File, nombreUsuario: string): Promise<string | null> {
  const extension = archivo.name.split('.').pop(); // obtenemos la extensión del archivo
  const nombreArchivo = `${nombreUsuario}_${Date.now()}.${extension}`;

  const { data, error } = await this.sb.supabase.storage
    .from(this.BUCKET_NAME)
    .upload(nombreArchivo, archivo);

  if (error) {
    console.error('Error al subir archivo:', error.message);
    return null;
  }

  // Obtenemos la URL pública
  const url = this.sb.supabase.storage.from(this.BUCKET_NAME).getPublicUrl(data!.path);

  return url.data.publicUrl;
}

async verificarAprobacionAdmin(correo: string): Promise<boolean> {
  const { data, error } = await this.tablaUsuarios
    .select("aprobacion_admin")
    .eq("email", correo)
    .single(); // esperamos un solo resultado

  if (error) {
    console.error("Error al verificar aprobación del admin:", error.message);
    return false;
  }

  return data?.aprobacion_admin === true;
}


}
