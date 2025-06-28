export interface Especialidad {
  id: string;
  nombre: string;
  foto: string | null;
}

export interface Usuario {
  id: string;
  nombre: string;
  foto_1: string;
  especialidades: string[];
}

export interface Disponibilidad {
  id: string;
  usuario_id: string;
  especialidad: string;
  dia_semana: number;   // 1–7
  hora_inicio: string;  // 'HH:MM'
  hora_fin: string;     // 'HH:MM'
}

export interface TurnoEntry {
  paciente_id: string;
  especialista_id: string;
  especialidad: string;
  fecha: string;   // 'YYYY-MM-DD'
  hora: string;    // 'HH:MM'
}
