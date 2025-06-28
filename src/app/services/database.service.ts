import { Injectable, inject} from '@angular/core';
import { SupabaseService } from './supabase.service';
import Swal from 'sweetalert2';
import { Especialidad, Disponibilidad, TurnoEntry, Usuario } from '../interfaces/turnos.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  sb = inject(SupabaseService);
  private BUCKET_NAME = 'fotosclinica';
  tablaUsuarios;
  tablaEspecialidades;
  constructor() {
    this.tablaUsuarios = this.sb.supabase.from("usuarios_clinica");
    this.tablaEspecialidades = this.sb.supabase.from("especialidades");
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

    async agregarEspecialidad(nombre: string) 
    {
    const { data, error } = await this.tablaEspecialidades.insert({nombre});
    if (error) {
      console.error('Error al agregar especialidad a la base de datos:', error.message);
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

async traerTodosLosUsuarios() {
    const { data, error } = await this.tablaUsuarios.select("*");
    if (error) {
      console.error('Error al solicitar todos los usuarios:', error.message);
    }
    return data as any[];
  }

  async traerTodosLosEspecialistas() {
    const { data, error } = await this.tablaUsuarios.select("*").eq("rol", "especialista");
    if (error) {
      console.error('Error al solicitar todos los especialistas:', error.message);
    }
    return data as any[];
  }

  async cambiarEstadoEspecialista(id_usuario:string, habilitar:boolean = false){
    const { data, error } = await this.tablaUsuarios.update({ aprobacion_admin: habilitar }).eq("id", id_usuario)
    if (error) {
      console.error('Error al cambiar estadodel especialista:', error.message);
    }
  }

  async traerUsuario(email: string): Promise<any | null> {
  const { data, error } = await this.tablaUsuarios.select('*').eq('email', email).single();

  if (error) {
    console.error('Error al solicitar los datos del usuario:', error.message);
    return null;
  }

  return data;
}

async guardarDisponibilidad(entry: {
  usuario_id: string;
  especialidad: string;
  dia_semana: number;
  hora_inicio: string; // 'HH:MM'
  hora_fin: string;    // 'HH:MM'
}) {
  const { data, error } = await this.sb.supabase
    .from('disponibilidad_especialistas')
    .upsert([entry], {
      onConflict: 'usuario_id,especialidad,dia_semana'
    });

  if (error) {
    console.error("Error al guardar disponibilidad:", error.message);
    Swal.fire({
      title: "Error",
      text: "Ocurrió un problema al guardar la disponibilidad.",
      icon: "error",
      confirmButtonText: "Ok",
      scrollbarPadding: false
    });
    return null;
  }

  Swal.fire({
    title: "Éxito",
    text: "Datos actualizados correctamente.",
    icon: "success",
    confirmButtonText: "OK",
    scrollbarPadding: false
  });

  return data;
}


 // 1. Todas las especialidades
  async getEspecialidades(): Promise<Especialidad[]> {
    const { data, error } = await this.sb.supabase
      .from('especialidades')
      .select('*');
    if (error) {
      console.error('Error getEspecialidades:', error.message);
      return [];
    }
    return data;
  }

  // 2. Profesionales que tengan en su campo text[] la especialidad dada
  async getProfesionalesPorEspecialidad(especialidad: string): Promise<Usuario[]> {
    const { data, error } = await this.sb.supabase
      .from('usuarios_clinica')
      .select('id, nombre, foto_1, especialidades')
      .eq('rol', 'especialista')
      // operador "cs" (contains) para text[]
      .contains('especialidades', [especialidad]);
    if (error) {
      console.error('Error getProfesionalesPorEspecialidad:', error.message);
      return [];
    }
    return data;
  }

  // 3. Disponibilidad de un especialista para una especialidad dada
  async getDisponibilidad(usuarioId: string, especialidad: string): Promise<Disponibilidad[]> {
    const { data, error } = await this.sb.supabase
      .from('disponibilidad_especialistas')
      .select('*')
      .eq('usuario_id', usuarioId)
      .eq('especialidad', especialidad);
    if (error) {
      console.error('Error getDisponibilidad:', error.message);
      return [];
    }
    return data;
  }

  // 4. Crear un turno (insert + UNIQUE constraint evita duplicados)
  async crearTurno(entry: TurnoEntry): Promise<void> {
    const { error } = await this.sb.supabase
      .from('turnos')
      .insert(entry);
    if (error) {
      if (error.code === '23505') {
        alert('Ese turno ya está reservado. Por favor, elegí otro horario.');
      } else {
        console.error('Error crearTurno:', error.message);
        alert('Error al reservar turno, intentá de nuevo más tarde.');
      }
    } else {
      alert('Turno reservado con éxito ✅');
    }
  }

}
