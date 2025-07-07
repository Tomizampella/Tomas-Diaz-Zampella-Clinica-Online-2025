export interface Especialidad {
  id: string;
  nombre: string;
  foto: string | null;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido:string;
  foto_1: string;
  especialidades: string[];
}

export interface Disponibilidad {
  id: string;
  usuario_id: string;
  especialidad: string;
  dia_semana: number;   
  hora_inicio: string;  
  hora_fin: string;     
}

export interface TurnoEntry {
  paciente_id: string;
  especialista_id: string;
  especialidad: string;
  fecha: string;   
  hora: string;  
}
