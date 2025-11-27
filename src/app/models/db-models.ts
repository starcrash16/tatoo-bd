export interface Cita {
    id: number;
    cliente: string;
    artista: string;
    fecha_programada: Date;
    estado: string;
    total_estimado: number;
  }
  
  export interface KPI {
    titulo: string;
    valor: string | number;
    icono: string;
    color: string;
  }